import { PrismaClient } from '@prisma/client';

import { CODE_FAIL_SERVER, CODE_FAIL_VALIDATION, MESSAGE_FAIL_SERVER } from '../config/constants';
import { IServiceResponse } from "../types/backend/response";
import { IEmployee, IEmployeeService } from "../types/backend/employee";
import { RequestEmployeeRegister, RequestEmployeeUpdate, RequestEmployeeLogin, RequestEmployeeDelete } from "../types/backend/request";
import { validateEmail, validatePassword, validatePhone, validateDate } from "../utils/validator";
import { formatDate } from "../utils/formattor";
import { hashPassword, verifyPassword } from "../utils/encryptor";

export class EmployeeService implements IEmployeeService {

  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // 직원 등록
  public async create(data: RequestEmployeeRegister): Promise<IServiceResponse> {
    // 이메일 유효성 검사
    const validatedEmail = validateEmail(data.email);
    if (!validatedEmail.result) {
      return {
        result: false,
        code: CODE_FAIL_VALIDATION,
        message: validatedEmail.message
      }
    }

    // name 필수 체크
    if (!data.name) {
      return {
        result: false,
        code: CODE_FAIL_VALIDATION,
        message: '이름을 입력해주세요.'
      }
    }

    // 패스워드 유효성 검사
    const validatedPassword = validatePassword(data.password, data.passwordConfirm);
    if (!validatedPassword.result) {
      return {
        result: false,
        code: CODE_FAIL_VALIDATION,
        message: validatedPassword.message
      }
    }

    // 전화번호가 있다면 유효성 검사
    if (data.phone) {
      const validatedPhone = validatePhone(data.phone);
      if (!validatedPhone.result) {
        return {
          result: false,
          code: CODE_FAIL_VALIDATION,
          message: validatedPhone.message
        }
      }
    }

    // 휴대폰 번호가 있다면 유효성 검사
    if (data.mobile) {
      const validatedMobile = validatePhone(data.mobile);
      if (!validatedMobile.result) {
        return {
          result: false,
          code: CODE_FAIL_VALIDATION,
          message: validatedMobile.message
        }
      }
    }

    // 고용일이 있다면 날짜 형식 체크
    let hireDate: Date | null = null;
    if (data.hireDate) {
      const formattedHireDate = formatDate(data.hireDate);
      if (!formattedHireDate.result) {
        return {
          result: false,
          code: CODE_FAIL_VALIDATION,
          message: formattedHireDate.message
        }
      }
      hireDate = formattedHireDate.data;
    }

    // 생년월일이 있다면 날짜 형식 체크
    let birthDate: Date | null = null;
    if (data.birthDate) {
      const formattedBirthDate = formatDate(data.birthDate);
      if (!formattedBirthDate.result) {
        return {
          result: false,
          code: CODE_FAIL_VALIDATION,
          message: formattedBirthDate.message
        }
      }
      birthDate = formattedBirthDate.data;
    }
    
    // 이메일 중복 체크
    const isUniqueEmail = await this.isUniqueEmail(data.email);
    if (!isUniqueEmail.result) {
      return isUniqueEmail;
    }

    try {
      // 패스워드 암호화
      const hashedPassword = await hashPassword(data.password);

      // 직원 등록
      const employee = await this.prisma.employee.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          position: data.position,
          description: data.description,
          phone: data.phone,
          mobile: data.mobile,
          address: data.address,
          hireDate: hireDate,
          birthDate: birthDate
        }
      });

      // 성공
      return { result: true };

    } catch (error) {
      console.error(error);
      return {
        result: false,
        code: CODE_FAIL_SERVER,
        message: MESSAGE_FAIL_SERVER
      }

    }
  }

  public async read(id: number): Promise<IServiceResponse<IEmployee>> {
    // 직원 조회
    try {
      const result = await this.prisma.employee.findUnique({
        where: {
          id: id
        }
      });

      // 조회 실패
      if (!result) {
        return {
          result: false,
          code: CODE_FAIL_VALIDATION,
          message: '직원을 찾을 수 없습니다.'
        }
      }

      // 반환할 직원 정보
      const employee: IEmployee = {
        id: result.id,
        email: result.email,
        name: result.name,
        position: result.position,
        description: result.description,
        phone: result.phone,
        mobile: result.mobile,
        address: result.address,
        hireDate: result.hireDate?.toISOString(),
        birthDate: result.birthDate?.toISOString(),
        fireDate: result.fireDate?.toISOString()
      };

      // 성공
      return { 
        result: true,
        data: employee
      };

    } catch (error) {
      console.error(error);
      return {
        result: false,
        code: CODE_FAIL_SERVER,
        message: MESSAGE_FAIL_SERVER
      }
    }
  }

  public async update(id: number, data: RequestEmployeeUpdate): Promise<IServiceResponse> {
    // Employee 와 다른 데이터만 수정

    // 직원 정보 조회
    const employee = await this.read(id);

    // 직원 정보가 없는 경우 에러
    if (!employee.result) {
      return {
        result: false,
        code: CODE_FAIL_VALIDATION,
        message: '직원을 찾을 수 없습니다.'
      };
    }

    // 수정할 데이터가 없는 경우 에러
    if (!data) {
      return {
        result: false,
        code: CODE_FAIL_VALIDATION,
        message: '수정할 데이터가 없습니다.'
      };
    }

    // 전화번호가 있다면 유효성 검사
    if (data.phone) {
      const validatedPhone = validatePhone(data.phone);
      if (!validatedPhone.result) {
        return {
          result: false,
          code: CODE_FAIL_VALIDATION,
          message: validatedPhone.message
        }
      }
    }

    // 휴대폰 번호가 있다면 유효성 검사
    if (data.mobile) {
      const validatedMobile = validatePhone(data.mobile);
      if (!validatedMobile.result) {
        return {
          result: false,
          code: CODE_FAIL_VALIDATION,
          message: validatedMobile.message
        }
      }
    }

    // 고용일이 있다면 날짜 형식 체크
    if (data.hireDate) {
      const validatedHireDate = validateDate(data.hireDate);
      if (!validatedHireDate.result) {
        return {
          result: false,
          code: CODE_FAIL_VALIDATION,
          message: validatedHireDate.message
        }
      }
    }

    // 생년월일이 있다면 날짜 형식 체크
    if (data.birthDate) {
      const validatedBirthDate = validateDate(data.birthDate);
      if (!validatedBirthDate.result) {
        return {
          result: false,
          code: CODE_FAIL_VALIDATION,
          message: validatedBirthDate.message
        }
      }
    }

    // 해고 날짜가 있다면 날짜 형식 체크
    if (data.fireDate) {
      const validatedFireDate = validateDate(data.fireDate);
      if (!validatedFireDate.result) {
        return {
          result: false,
          code: CODE_FAIL_VALIDATION,
          message: validatedFireDate.message
        }
      }
    }

    try {
      // 직원 정보 수정
      await this.prisma.employee.update({
        where: {
          id: id
        },
        data: {
          phone: data.phone,
          mobile: data.mobile,
          address: data.address,
          hireDate: data.hireDate ? new Date(data.hireDate) : null,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          fireDate: data.fireDate ? new Date(data.fireDate) : null
        }
      });

      // 성공
      return { result: true };

    } catch (error) {
      // 실패
      console.error(error);
      return {
        result: false,
        code: CODE_FAIL_SERVER,
        message: MESSAGE_FAIL_SERVER
      }
    }
  }
  
  public async delete(id: number, data: RequestEmployeeDelete): Promise<IServiceResponse> {
    // 직원 정보 조회
    const employee = await this.read(id);

    // 직원 정보가 없는 경우 에러
    if (!employee.result) {
      return {
        result: false,
        code: CODE_FAIL_VALIDATION,
        message: '직원을 찾을 수 없습니다.'
      };
    }

    try {
      // fireDate 파라미터가 날짜 형식이 아닌 경우 에러 처리
      let fireDate: Date | null = null;
      if (data.fireDate) {
        const formattedHireDate = formatDate(data.fireDate);
        if (!formattedHireDate.result) {
          return {
            result: false,
            code: CODE_FAIL_VALIDATION,
            message: formattedHireDate.message
          }
        }
        fireDate = formattedHireDate.data;
      }
      
      // 직원 정보 삭제(탈퇴) 처리
      await this.prisma.employee.update({
        where: {
          id: id
        },
        data: {
          fireDate: fireDate,
          isActivated: true,
          isDeleted: true,
        }
      });

      // 성공
      return { result: true };

    } catch (error) {
      // 실패
      console.error(error);
      return {
        result: false,
        code: CODE_FAIL_SERVER,
        message: MESSAGE_FAIL_SERVER
      }
    }
  }

  public async login(data: RequestEmployeeLogin): Promise<IServiceResponse<IEmployee>> {
    // 이메일 필수 체크
    if (!data.email) {
      return {
        result: false,
        code: CODE_FAIL_VALIDATION,
        message: '이메일을 입력해주세요.'
      }
    }

    // 패스워드 필수 체크
    if (!data.password) {
      return {
        result: false,
        code: CODE_FAIL_VALIDATION,
        message: '패스워드를 입력해주세요.'
      }
    }

    // TODO: 패스워드 암호화 처리 필요

    // 직원 로그인
    try {
      // 직원 조회
      const result = await this.prisma.employee.findFirst({
        where: {
          email: data.email,
          isDeleted: false,
          isActivated: true
        }
      });

      // 직원이 없는 경우
      if (!result) {
        return {
          result: false,
          code: CODE_FAIL_VALIDATION,
          message: '이메일 또는 패스워드가 일치하지 않습니다.'
        }
      }
      
      // 패스워드 비교
      const isPasswordMatch = await verifyPassword(data.password, result.password);

      // 패스워드 불일치
      if (!isPasswordMatch) {
        return {
          result: false,
          code: CODE_FAIL_VALIDATION,
          message: '이메일 또는 패스워드가 일치하지 않습니다.'
        }
      }

      // 반환할 직원 정보
      const employee: IEmployee = {
        id: result.id,
        email: result.email,
        name: result.name,
        position: result.position,
        description: result.description,
        phone: result.phone,
        mobile: result.mobile,
        address: result.address
      };

      // 성공
      return { 
        result: true,
        data: employee
      };

    } catch (error) {
      console.error(error);
      return {
        result: false,
        code: CODE_FAIL_SERVER,
        message: MESSAGE_FAIL_SERVER
      }
    }
  }

  public async search(keyword: string): Promise<IServiceResponse<IEmployee[]>> {

    return { result: true, data: [] };

  }

  // 직원 Email 중복 체크
  public async isUniqueEmail(email: string): Promise<IServiceResponse> {
    try {
      // 이메일 중복 체크
      const isUnique = await this.prisma.employee.findUnique({
        where: {
          email: email,
          isDeleted: false
        }
      });

      // 중복된 이메일이 있다면
      if (isUnique) {
        return {
          result: false,
          code: CODE_FAIL_VALIDATION,
          message: '이미 사용중인 이메일입니다.'
        }
      }

      // 성공
      return { result: true };

    } catch (error) {
      console.error(error);
      return {
        result: false,
        code: CODE_FAIL_SERVER,
        message: MESSAGE_FAIL_SERVER
      };
    }
    
  }

  public async close() {
    // TODO: PrismaClient 연결 해제가 필요한지 연구해 볼 것
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }
}