export interface RequestEmployeeRegister {
  email: string;
  name: string;
  password: string;
  passwordConfirm: string;
  position?: string;
  description?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  hireDate?: string; // 선택적 필드 (ISO 날짜 문자열)
  birthDate?: string; // 선택적 필드 (ISO 날짜 문자열)
}

export interface RequestEmployeeUpdate {
  name?: string;
  position?: string;
  description?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  hireDate?: string;
  birthDate?: string;
  fireDate?: string;
}

export interface RequestEmployeeLogin {
  email: string;
  password: string;
}