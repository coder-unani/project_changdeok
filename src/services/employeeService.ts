import { hashPassword, verifyPassword } from '../library/encrypt';
import { AppError, AuthError, NotFoundError, ValidationError } from '../common/utils/error';
import { formatDate, formatDateToString, formatEmailMasking } from '../common/utils/format';
import { validateDate, validateEmail, validatePassword, validatePhone } from '../common/utils/validate';
import { httpStatus } from '../common/variables';
import { ExtendedPrismaClient } from '../library/database';
import { IEmployee } from '../types/object';
import {
  IRequestEmployeeDelete,
  IRequestEmployeeForceUpdatePassword,
  IRequestEmployeeLogin,
  IRequestEmployeeRegister,
  IRequestEmployeeUpdate,
  IRequestEmployeeUpdatePassword,
  IRequestEmployees,
} from '../types/request';
import { IServiceResponse } from '../types/response';
import { IEmployeeService } from '../types/service';

export class EmployeeService implements IEmployeeService {
  private prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    this.prisma = prisma;
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

      // 전화번호가 있다면 유효성 검사
      if (data.phone) {
        const validatedPhone = validatePhone(data.phone);
        if (!validatedPhone.result) {
          throw new ValidationError(validatedPhone.message);
        }

        // 전화번호 숫자만 남기고 제거
        data.phone = data.phone.replace(/[^0-9]/g, '');
      }

      // 휴대폰 번호가 있다면 유효성 검사
      if (data.mobile) {
        const validatedMobile = validatePhone(data.mobile);
        if (!validatedMobile.result) {
          throw new ValidationError(validatedMobile.message);
        }

        // 휴대폰번호 숫자만 남기고 제거
        data.mobile = data.mobile.replace(/[^0-9]/g, '');
      }

      // 고용일이 있다면 날짜 형식 체크
      let hireDate: Date | null = null;
      if (data.hireDate) {
        const formattedHireDate = formatDate(data.hireDate);
        if (!formattedHireDate.result) {
          throw new ValidationError(formattedHireDate.message);
        }
        hireDate = formattedHireDate.data;
      }

      // 생년월일이 있다면 날짜 형식 체크
      let birthDate: Date | null = null;
      if (data.birthDate) {
        const formattedBirthDate = formatDate(data.birthDate);
        if (!formattedBirthDate.result) {
          throw new ValidationError(formattedBirthDate.message);
        }
        birthDate = formattedBirthDate.data;
      }

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
          phone: data.phone?.trim(),
          mobile: data.mobile?.trim(),
          address: data.address?.trim(),
          hireDate: hireDate,
          birthDate: birthDate,
        },
      });

      // 성공
      return { result: true };
    } catch (error) {
      if (error instanceof AppError) {
        return { result: false, code: error.statusCode, message: error.message };
      } else {
        return {
          result: false,
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: '서버 오류가 발생했습니다.',
        };
      }
    }
  }

  public async read(id: number): Promise<IServiceResponse<IEmployee>> {
    // 직원 조회
    try {
      const result = await this.prisma.employee.findUnique({
        where: {
          id: id,
        },
        include: {
          permissions: true,
        },
      });

      // 조회 실패
      if (!result) {
        throw new NotFoundError('직원을 찾을 수 없습니다.');
      }

      const employeeEmail = formatEmailMasking(result.email);
      if (!employeeEmail.result) {
        throw new ValidationError(employeeEmail.message);
      }

      // 반환할 직원 정보
      const formattedBirthDate = formatDateToString(result.birthDate?.toISOString(), false, true, true);
      const formattedHireDate = formatDateToString(result.hireDate?.toISOString(), false, true, true);
      const formattedFireDate = formatDateToString(result.fireDate?.toISOString(), false, true, true);

      const employee: IEmployee = {
        id: result.id,
        email: employeeEmail.data || result.email,
        name: result.name,
        position: result.position,
        description: result.description,
        phone: result.phone,
        mobile: result.mobile,
        address: result.address,
        hireDate: (formattedHireDate as string) || null,
        fireDate: (formattedFireDate as string) || null,
        birthDate: (formattedBirthDate as string) || null,
        isActivated: result.isActivated,
        permissions: result.permissions.map((permission) => permission.permissionId),
      };

      // 성공
      return {
        result: true,
        data: employee,
      };
    } catch (error) {
      if (error instanceof AppError) {
        return { result: false, code: error.statusCode, message: error.message };
      } else {
        return {
          result: false,
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: '서버 오류가 발생했습니다.',
        };
      }
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

      // 전화번호가 있다면 유효성 검사
      if (data.phone) {
        const validatedPhone = validatePhone(data.phone);
        if (!validatedPhone.result) {
          throw new ValidationError(validatedPhone.message);
        }
      }

      // 휴대폰 번호가 있다면 유효성 검사
      if (data.mobile) {
        const validatedMobile = validatePhone(data.mobile);
        if (!validatedMobile.result) {
          throw new ValidationError(validatedMobile.message);
        }
      }

      // 고용일이 있다면 날짜 형식 체크
      if (data.hireDate) {
        const validatedHireDate = validateDate(data.hireDate);
        if (!validatedHireDate.result) {
          throw new ValidationError(validatedHireDate.message);
        }
      }

      // 생년월일이 있다면 날짜 형식 체크
      if (data.birthDate) {
        const validatedBirthDate = validateDate(data.birthDate);
        if (!validatedBirthDate.result) {
          throw new ValidationError(validatedBirthDate.message);
        }
      }

      // 해고 날짜가 있다면 날짜 형식 체크
      if (data.fireDate) {
        const validatedFireDate = validateDate(data.fireDate);
        if (!validatedFireDate.result) {
          throw new ValidationError(validatedFireDate.message);
        }
      }

      // 직원 정보 수정. 변경된 데이터 리턴
      const prismaUpdatedEmployee = await this.prisma.employee.update({
        where: {
          id: id,
        },
        data: {
          name: data.name?.trim(),
          position: data.position?.trim(),
          description: data.description?.trim(),
          phone: data.phone?.trim(),
          mobile: data.mobile?.trim(),
          address: data.address?.trim(),
          hireDate: data.hireDate ? new Date(data.hireDate) : null,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          fireDate: data.fireDate ? new Date(data.fireDate) : null,
        },
      });

      const employee: IEmployee = {
        id: prismaUpdatedEmployee.id,
        email: prismaUpdatedEmployee.email,
        name: prismaUpdatedEmployee.name,
        position: prismaUpdatedEmployee.position,
        description: prismaUpdatedEmployee.description,
        phone: prismaUpdatedEmployee.phone,
        mobile: prismaUpdatedEmployee.mobile,
        address: prismaUpdatedEmployee.address,
        hireDate: prismaUpdatedEmployee.hireDate?.toISOString(),
        birthDate: prismaUpdatedEmployee.birthDate?.toISOString(),
        fireDate: prismaUpdatedEmployee.fireDate?.toISOString(),
      };

      // 성공
      return { result: true, data: employee };
    } catch (error) {
      if (error instanceof AppError) {
        return { result: false, code: error.statusCode, message: error.message };
      } else {
        return {
          result: false,
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: '서버 오류가 발생했습니다.',
        };
      }
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
        where: {
          id: id,
          isDeleted: false,
        },
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
        where: {
          id: id,
          isDeleted: false,
        },
        data: {
          password: hashedPasswordNew,
        },
      });

      // 성공
      return { result: true };
    } catch (error) {
      if (error instanceof AppError) {
        return { result: false, code: error.statusCode, message: error.message };
      } else {
        return {
          result: false,
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: '서버 오류가 발생했습니다.',
        };
      }
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
      const prismaEmployee = await this.prisma.employee.findUnique({
        where: {
          id: id,
          isDeleted: false,
        },
      });

      // 직원 정보가 없는 경우 에러
      if (!prismaEmployee) {
        throw new NotFoundError('직원을 찾을 수 없습니다.');
      }

      // 비활성화 직원
      if (!prismaEmployee.isActivated) {
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
        where: {
          id: id,
          isDeleted: false,
        },
        data: {
          password: hashedPasswordNew,
        },
      });

      // 성공
      return { result: true };
    } catch (error) {
      if (error instanceof AppError) {
        return { result: false, code: error.statusCode, message: error.message };
      } else {
        return {
          result: false,
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: '서버 오류가 발생했습니다.',
        };
      }
    }
  }

  public async delete(id: number, data: IRequestEmployeeDelete): Promise<IServiceResponse> {
    // 직원 정보 조회
    const employeeInfo = await this.read(id);

    // 직원 정보가 없는 경우 에러
    if (!employeeInfo.result) {
      throw new NotFoundError('직원을 찾을 수 없습니다.');
    }

    try {
      // fireDate 파라미터가 날짜 형식이 아닌 경우 에러 처리
      let fireDate: Date | null = null;
      if (data.fireDate) {
        const formattedHireDate = formatDate(data.fireDate);
        if (!formattedHireDate.result) {
          throw new ValidationError(formattedHireDate.message);
        }
        fireDate = formattedHireDate.data;
      }

      // 직원 정보 삭제(탈퇴) 처리
      await this.prisma.employee.update({
        where: {
          id: id,
        },
        data: {
          fireDate: fireDate || new Date(),
          isActivated: false,
          isDeleted: true,
        },
      });

      // 성공
      return { result: true };
    } catch (error) {
      if (error instanceof AppError) {
        return { result: false, code: error.statusCode, message: error.message };
      } else {
        return {
          result: false,
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: '서버 오류가 발생했습니다.',
        };
      }
    }
  }

  public async list(data: IRequestEmployees): Promise<IServiceResponse<IEmployee[] | []>> {
    try {
      // 페이지 번호가 없거나 1보다 작은 경우 1로 설정
      if (!data.page || data.page < 1) {
        data.page = 1;
      }

      // 페이지 크기가 작거나 너무 크면 10으로 설정
      if (!data.pageSize || data.pageSize < 1 || data.pageSize > 100) {
        data.pageSize = 10;
      }

      // 정렬이 없는 경우 id로 설정
      if (!data.sort) {
        data.sort = 'ID_ASC';
      }

      let orderBy = {};
      if (data.sort === 'ID_DESC') {
        orderBy = {
          id: 'desc',
        };
      } else if (data.sort === 'ID_ASC') {
        orderBy = {
          id: 'asc',
        };
      } else if (data.sort === 'TITLE_DESC') {
        orderBy = {
          name: 'desc',
        };
      } else if (data.sort === 'TITLE_ASC') {
        orderBy = {
          name: 'asc',
        };
      }

      // 전체 직원 수 조회
      const prismaTotal = await this.prisma.employee.count({
        where: {
          isDeleted: false,
        },
      });

      // 직원 리스트 조회
      const prismaEmployee = await this.prisma.employee.findMany({
        where: {
          isDeleted: false,
        },
        skip: (data.page - 1) * data.pageSize,
        take: data.pageSize,
        orderBy: orderBy,
      });

      // IEmployees 배열로 변환
      const employees: IEmployee[] = prismaEmployee.map((employee) => {
        // 이메일 마스킹 처리
        const employeeEmail = formatEmailMasking(employee.email);

        return {
          id: employee.id,
          email: employeeEmail.data || employee.email,
          name: employee.name,
          position: employee.position,
          description: employee.description,
          phone: employee.phone,
          mobile: employee.mobile,
          address: employee.address,
          hireDate: employee.hireDate?.toISOString(),
          birthDate: employee.birthDate?.toISOString(),
          fireDate: employee.fireDate?.toISOString(),
          createdAt: formatDateToString(employee.createdAt, false, true, true) as string,
          updatedAt: formatDateToString(employee.updatedAt, false, true, true) as string,
        };
      });

      // 메타데이터 생성
      const metadata = {
        total: prismaTotal,
        page: data.page,
        pageSize: data.pageSize,
        start: (data.page - 1) * data.pageSize + 1,
        end: (data.page - 1) * data.pageSize + employees.length,
        count: employees.length,
        totalPage: Math.ceil(prismaTotal / data.pageSize),
      };

      return { result: true, metadata, data: employees };
    } catch (error) {
      if (error instanceof AppError) {
        return { result: false, code: error.statusCode, message: error.message };
      } else {
        return {
          result: false,
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: '서버 오류가 발생했습니다.',
        };
      }
    }
  }

  public async login(data: IRequestEmployeeLogin): Promise<IServiceResponse<IEmployee>> {
    try {
      // 이메일 필수 체크
      if (!data.email) {
        throw new ValidationError('이메일을 입력해주세요.');
      }

      // 패스워드 필수 체크
      if (!data.password) {
        throw new ValidationError('패스워드를 입력해주세요.');
      }

      // 직원 조회
      const prismaEmployee = await this.prisma.employee.findFirst({
        where: {
          email: data.email,
          isDeleted: false,
          isActivated: true,
        },
        include: {
          permissions: true,
        },
      });

      // 직원이 없는 경우
      if (!prismaEmployee) {
        throw new AuthError('이메일 또는 패스워드가 일치하지 않습니다.');
      }

      // 패스워드 비교
      const isPasswordMatch = await verifyPassword(data.password, prismaEmployee.password);

      // 패스워드 불일치
      if (!isPasswordMatch) {
        throw new AuthError('이메일 또는 패스워드가 일치하지 않습니다.');
      }

      // 권한의 permissionId를 배열로 변환
      const permissions = prismaEmployee.permissions.map((permission) => permission.permissionId);

      // 반환할 직원 정보
      const employee: IEmployee = {
        id: prismaEmployee.id,
        email: prismaEmployee.email,
        name: prismaEmployee.name,
        position: prismaEmployee.position,
        description: prismaEmployee.description,
        phone: prismaEmployee.phone,
        mobile: prismaEmployee.mobile,
        address: prismaEmployee.address,
        permissions: permissions,
      };

      // 성공
      return {
        result: true,
        data: employee,
      };
    } catch (error) {
      if (error instanceof AppError) {
        return { result: false, code: error.statusCode, message: error.message };
      } else {
        return {
          result: false,
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: '서버 오류가 발생했습니다.',
        };
      }
    }
  }

  // 직원 Email 중복 체크
  public async isUniqueEmail(email: string): Promise<IServiceResponse> {
    try {
      // 이메일 중복 체크
      const isUnique = await this.prisma.employee.findFirst({
        where: {
          email: email,
          isDeleted: false,
        },
      });

      // 중복된 이메일이 있다면
      if (isUnique) {
        throw new ValidationError('이미 사용중인 이메일입니다.');
      }

      // 성공
      return { result: true };
    } catch (error) {
      if (error instanceof AppError) {
        return { result: false, code: error.statusCode, message: error.message };
      } else {
        return {
          result: false,
          code: httpStatus.INTERNAL_SERVER_ERROR,
          message: '서버 오류가 발생했습니다.',
        };
      }
    }
  }

  public async close() {
    // TODO: PrismaClient 연결 해제가 필요한지 연구해 볼 것
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }
}
