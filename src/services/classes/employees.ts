import { AuthError, NotFoundError, ValidationError } from '../../common/error';
import {
  convertDateToKST,
  convertDateToString,
  convertDateToUTC,
  convertStringToDate,
  formatEmailMasking,
} from '../../common/utils/format';
import { validateEmail, validatePassword, validatePhone } from '../../common/utils/validate';
import { ExtendedPrismaClient } from '../../library/database';
import { hashPassword, verifyPassword } from '../../library/encrypt';
import { IServiceResponse } from '../../types/config';
import { IEmployee } from '../../types/object';
import {
  IRequestEmployeeDelete,
  IRequestEmployeeForceUpdatePassword,
  IRequestEmployeeLogin,
  IRequestEmployeeRegister,
  IRequestEmployeeUpdate,
  IRequestEmployeeUpdatePassword,
  IRequestEmployees,
} from '../../types/request';
import { IEmployeeService } from '../../types/service';
import { BaseService } from './service';

export class EmployeeService extends BaseService implements IEmployeeService {
  constructor(prisma: ExtendedPrismaClient) {
    super(prisma);
  }

  // 공통 유효성 검사 메서드
  private validatePhoneNumber(phone: string | undefined): void {
    if (phone) {
      const validatedPhone = validatePhone(phone);
      if (!validatedPhone.result) {
        throw new ValidationError(validatedPhone.message);
      }
    }
  }

  private validateDateField(date: string | undefined): Date {
    if (!date) {
      throw new ValidationError('날짜를 입력해주세요.');
    }
    return convertStringToDate(date);
  }

  // 직원 정보 변환 메서드
  private convertToEmployee(employee: any): IEmployee {
    const employeeMaskedEmail = formatEmailMasking(employee.email);

    const hireDate = employee.hireDate ? convertDateToString(convertDateToKST(employee.hireDate), false) : null;
    const fireDate = employee.fireDate ? convertDateToString(convertDateToKST(employee.fireDate), false) : null;
    const birthDate = employee.birthDate ? convertDateToString(convertDateToKST(employee.birthDate), false) : null;
    const lastLoginAt = employee.lastLoginAt ? convertDateToString(convertDateToKST(employee.lastLoginAt)) : null;
    const createdAt = employee.createdAt ? convertDateToString(convertDateToKST(employee.createdAt)) : null;
    const updatedAt = employee.updatedAt ? convertDateToString(convertDateToKST(employee.updatedAt)) : null;

    return {
      id: employee.id,
      email: employeeMaskedEmail,
      name: employee.name,
      position: employee.position,
      description: employee.description,
      phone: employee.phone,
      mobile: employee.mobile,
      address: employee.address,
      hireDate: hireDate,
      fireDate,
      birthDate,
      isActivated: employee.isActivated,
      permissions: employee.permissions?.map((p: any) => p.permissionId),
      lastLoginAt,
      createdAt,
      updatedAt,
    };
  }

  // 직원 등록
  public async create(data: IRequestEmployeeRegister): Promise<IServiceResponse> {
    try {
      // 이메일 유효성 검사
      const validatedEmail = validateEmail(data.email);
      if (!validatedEmail.result) {
        throw new ValidationError(validatedEmail.message);
      }

      // name 필수 체크
      if (!data.name) {
        throw new ValidationError('이름을 입력해주세요.');
      }

      // 패스워드 유효성 검사
      const validatedPassword = validatePassword(data.password, data.passwordConfirm);
      if (!validatedPassword.result) {
        throw new ValidationError(validatedPassword.message);
      }

      // 전화번호 유효성 검사
      this.validatePhoneNumber(data.phone);
      this.validatePhoneNumber(data.mobile);

      // 날짜 형식 체크
      const hireDate = data.hireDate ? convertStringToDate(data.hireDate) : null;
      const birthDate = data.birthDate ? convertStringToDate(data.birthDate) : null;

      // 이메일 중복 체크
      const isUniqueEmail = await this.isUniqueEmail(data.email);
      if (!isUniqueEmail.result) {
        return isUniqueEmail;
      }

      // 패스워드 암호화
      const hashedPassword = await hashPassword(data.password);

      // 직원 등록
      const employee = await this.prisma.employee.create({
        data: {
          email: data.email.trim(),
          name: data.name.trim(),
          password: hashedPassword,
          position: data.position?.trim(),
          description: data.description?.trim(),
          phone: data.phone?.replace(/[^0-9]/g, ''),
          mobile: data.mobile?.replace(/[^0-9]/g, ''),
          address: data.address?.trim(),
          hireDate,
          birthDate,
        },
      });

      // 권한 부여
      if (data.permissions) {
        await this.prisma.employeePermission.createMany({
          data: data.permissions.map((permission) => ({
            employeeId: employee.id,
            permissionId: permission,
            grantedAt: new Date(),
            grantedById: data.grantedById || 0,
          })),
        });
      }

      // 성공
      return { result: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async read(id: number): Promise<IServiceResponse<IEmployee>> {
    try {
      // 직원 조회
      const result = await this.prisma.employee.findUnique({
        where: { id },
        include: { permissions: true },
      });

      // 조회 실패
      if (!result) {
        throw new NotFoundError('직원을 찾을 수 없습니다.');
      }

      // 성공
      return {
        result: true,
        data: this.convertToEmployee(result),
      };
    } catch (error) {
      return this.handleError<IEmployee>(error);
    }
  }

  public async update(id: number, data: IRequestEmployeeUpdate): Promise<IServiceResponse<IEmployee>> {
    try {
      // 직원 정보 조회
      const employeeInfo = await this.read(id);

      // 직원 정보가 없는 경우 에러
      if (!employeeInfo.result) {
        throw new NotFoundError('직원을 찾을 수 없습니다.');
      }

      // 수정할 데이터가 없는 경우 에러
      if (!data) {
        throw new ValidationError('수정할 데이터가 없습니다.');
      }

      // 전화번호 유효성 검사
      this.validatePhoneNumber(data.phone);
      this.validatePhoneNumber(data.mobile);

      // 날짜 형식 체크
      const hireDate = data.hireDate ? convertStringToDate(data.hireDate) : null;
      const birthDate = data.birthDate ? convertStringToDate(data.birthDate) : null;
      const fireDate = data.fireDate ? convertStringToDate(data.fireDate) : null;

      // 직원 정보 수정
      const updatedEmployee = await this.prisma.employee.update({
        where: { id },
        data: {
          name: data.name?.trim(),
          position: data.position?.trim(),
          description: data.description?.trim(),
          phone: data.phone?.trim(),
          mobile: data.mobile?.trim(),
          address: data.address?.trim(),
          hireDate,
          birthDate,
          fireDate,
        },
      });

      // 성공
      return {
        result: true,
        data: this.convertToEmployee(updatedEmployee),
      };
    } catch (error) {
      return this.handleError<IEmployee>(error);
    }
  }

  // 직원 비밀번호 변경
  public async updatePassword(id: number, data: IRequestEmployeeUpdatePassword): Promise<IServiceResponse> {
    try {
      // 수정할 데이터가 없는 경우 에러
      if (!data) {
        throw new ValidationError('수정할 데이터가 없습니다.');
      }

      // 직원 정보 조회
      const employee = await this.prisma.employee.findUnique({
        where: { id, isDeleted: false },
      });

      // 직원 정보가 없는 경우 에러
      if (!employee) {
        throw new NotFoundError('직원을 찾을 수 없습니다.');
      }

      // 비활성화 직원
      if (!employee.isActivated) {
        throw new ValidationError('비활성화된 직원은 비밀번호를 변경할 수 없습니다.');
      }

      // 패스워드 유효성 검사
      const validatedPassword = validatePassword(data.passwordNew, data.passwordNewConfirm);
      if (!validatedPassword.result) {
        throw new ValidationError(validatedPassword.message);
      }

      // 패스워드 비교
      const isPasswordMatch = await verifyPassword(data.password, employee.password);

      // 패스워드 불일치
      if (!isPasswordMatch) {
        throw new ValidationError('아이디 또는 비밀번호가 일치하지 않습니다.');
      }

      // 새로운 패스워드 암호화
      const hashedPasswordNew = await hashPassword(data.passwordNew);

      // 직원 비밀번호 변경
      await this.prisma.employee.update({
        where: { id, isDeleted: false },
        data: { password: hashedPasswordNew },
      });

      // 성공
      return { result: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // 직원 비밀번호 강제 변경
  public async updatePasswordForce(id: number, data: IRequestEmployeeForceUpdatePassword): Promise<IServiceResponse> {
    try {
      // 수정할 데이터가 없는 경우 에러
      if (!data) {
        throw new ValidationError('수정할 데이터가 없습니다.');
      }

      // 직원 정보 조회
      const employee = await this.prisma.employee.findUnique({
        where: { id, isDeleted: false },
      });

      // 직원 정보가 없는 경우 에러
      if (!employee) {
        throw new NotFoundError('직원을 찾을 수 없습니다.');
      }

      // 비활성화 직원
      if (!employee.isActivated) {
        throw new ValidationError('비활성화된 직원은 비밀번호를 변경할 수 없습니다.');
      }

      // 패스워드 유효성 검사
      const validatedPassword = validatePassword(data.passwordNew, data.passwordNewConfirm);
      if (!validatedPassword.result) {
        throw new ValidationError(validatedPassword.message);
      }

      // 새로운 패스워드 암호화
      const hashedPasswordNew = await hashPassword(data.passwordNew);

      // 직원 비밀번호 변경
      await this.prisma.employee.update({
        where: { id, isDeleted: false },
        data: { password: hashedPasswordNew },
      });

      // 성공
      return { result: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async delete(id: number, data: IRequestEmployeeDelete): Promise<IServiceResponse> {
    try {
      // 직원 정보 조회
      const employeeInfo = await this.read(id);

      // 직원 정보가 없는 경우 에러
      if (!employeeInfo.result) {
        throw new NotFoundError('직원을 찾을 수 없습니다.');
      }

      // fireDate 파라미터가 날짜 형식이 아닌 경우 에러 처리
      const fireDate = this.validateDateField(data.fireDate) || new Date();

      // 직원 정보 삭제(탈퇴) 처리
      await this.prisma.employee.update({
        where: { id },
        data: {
          fireDate,
          isActivated: false,
          isDeleted: true,
        },
      });

      // 성공
      return { result: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async list(data: IRequestEmployees): Promise<IServiceResponse<IEmployee[] | []>> {
    try {
      // 페이지 번호가 없거나 1보다 작은 경우 1로 설정
      const page = Math.max(1, data.page || 1);

      // 페이지 크기가 작거나 너무 크면 10으로 설정
      const pageSize = Math.min(100, Math.max(1, data.pageSize || 10));

      // 정렬이 없는 경우 id로 설정
      const sort = data.sort || 'ID_ASC';

      // 정렬 조건 설정
      const orderBy = {
        ID_DESC: { id: 'desc' as const },
        ID_ASC: { id: 'asc' as const },
        TITLE_DESC: { name: 'desc' as const },
        TITLE_ASC: { name: 'asc' as const },
      }[sort] || { id: 'asc' as const };

      // 전체 직원 수와 직원 리스트 병렬 조회
      const [total, employees] = await Promise.all([
        this.prisma.employee.count({ where: { isDeleted: false } }),
        this.prisma.employee.findMany({
          where: { isDeleted: false },
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy,
        }),
      ]);

      // 직원 정보 변환
      const formattedEmployees = employees.map((employee) => this.convertToEmployee(employee));

      // 메타데이터 생성
      const metadata = {
        total,
        page,
        pageSize,
        start: (page - 1) * pageSize + 1,
        end: (page - 1) * pageSize + formattedEmployees.length,
        count: formattedEmployees.length,
        totalPage: Math.ceil(total / pageSize),
      };

      // 성공
      return {
        result: true,
        metadata,
        data: formattedEmployees,
      };
    } catch (error) {
      return this.handleError<IEmployee[] | []>(error);
    }
  }

  public async login(data: IRequestEmployeeLogin): Promise<IServiceResponse<IEmployee>> {
    try {
      // 이메일과 패스워드 필수 체크
      if (!data.email || !data.password) {
        throw new ValidationError('이메일과 패스워드를 입력해주세요.');
      }

      // 직원 조회
      const employee = await this.prisma.employee.findFirst({
        where: {
          email: data.email,
          isDeleted: false,
          isActivated: true,
        },
        include: { permissions: true },
      });

      // 직원이 없는 경우
      if (!employee) {
        throw new AuthError('이메일 또는 패스워드가 일치하지 않습니다.');
      }

      // 패스워드 비교
      const isPasswordMatch = await verifyPassword(data.password, employee.password);

      // 패스워드 불일치
      if (!isPasswordMatch) {
        throw new AuthError('이메일 또는 패스워드가 일치하지 않습니다.');
      }

      // 마지막 로그인 시간 설정
      const lastLoginAt = employee.lastLoginAt || new Date();

      // 마지막 로그인 시간 업데이트
      await this.prisma.employee.update({
        where: { id: employee.id },
        data: { lastLoginAt: new Date() },
      });

      // 로그인 이력 기록
      await this.prisma.employeeLoginHistory.create({
        data: {
          employeeId: employee.id,
          employeeEmail: data.email,
          loginAt: new Date(),
          status: 'SUCCESS',
          message: '로그인 성공',
          origin: data.origin,
          referer: data.referer,
          clientIp: data.clientIp,
          userAgent: data.userAgent,
        },
      });

      // 성공
      return {
        result: true,
        metadata: {
          lastLoginAt,
        },
        data: this.convertToEmployee(employee),
      };
    } catch (error) {
      // 로그인 이력 기록
      await this.prisma.employeeLoginHistory.create({
        data: {
          employeeEmail: data.email,
          loginAt: new Date(),
          status: 'FAIL',
          message: error instanceof Error ? error.message : 'Unknown error',
          origin: data.origin,
          referer: data.referer,
          clientIp: data.clientIp,
          userAgent: data.userAgent,
        },
      });

      return this.handleError<IEmployee>(error);
    }
  }

  // 직원 Email 중복 체크
  public async isUniqueEmail(email: string): Promise<IServiceResponse> {
    try {
      // 이메일 중복 체크
      const isUnique = await this.prisma.employee.findFirst({
        where: { email, isDeleted: false },
      });

      // 중복된 이메일이 있다면
      if (isUnique) {
        throw new ValidationError('이미 사용중인 이메일입니다.');
      }

      // 성공
      return { result: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async close() {
    // TODO: PrismaClient 연결 해제가 필요한지 연구해 볼 것
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }
}
