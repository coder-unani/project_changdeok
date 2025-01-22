export interface RequestEmployeeRegister {
  email: string;
  name: string;
  password: string;
  passwordConfirm: string;
  position?: string; // 선택적 필드
  description?: string; // 선택적 필드
  phone?: string; // 선택적 필드
  mobile?: string; // 선택적 필드
  address?: string; // 선택적 필드
  hireDate?: string; // 선택적 필드 (ISO 날짜 문자열)
  birthDate?: string; // 선택적 필드 (ISO 날짜 문자열)
}

export interface RequestEmployeeLogin {
  email: string;
  password: string;
}