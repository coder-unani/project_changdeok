import { Prisma, PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

/**
 * prisma-accelerate는 Prisma Client의 확장 프로젝트로, Prisma Client의 성능을 최적화하는 기능을 제공한다.
 * PrismaClientSingleton 클래스는 PrismaClient 인스턴스를 생성하고, 이를 반환하는 역할을 한다.
 * 이 클래스는 싱글톤 패턴을 사용하여 하나의 인스턴스만 생성하도록 구현했다.
 */

// Prisma Client의 확장된 타입을 정의
type ExtendedPrismaClient = ReturnType<(typeof PrismaClient)['prototype']['$extends']> & PrismaClient;

// Prisma 인스턴스 생성하는 클래스
class PrismaClientSingleton {
  private static instance: ExtendedPrismaClient;
  private static baseClient: PrismaClient;

  // Prisma Client 인스턴스 생성
  private static createPrismaClient(): ExtendedPrismaClient {
    // Prisma Client 옵션 설정
    let prismaOptions: Prisma.PrismaClientOptions = {};

    // 개발 환경 설정
    if (process.env.NODE_ENV !== 'production') {
      prismaOptions.log = [
        { emit: 'stdout', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
      ];
    }

    // Prisma Client 인스턴스 생성
    this.baseClient = new PrismaClient(prismaOptions);

    // Prisma Client 확장 설정
    return this.baseClient.$extends(withAccelerate()) as unknown as ExtendedPrismaClient;
  }

  // Prisma Client 인스턴스 반환
  public static getInstance(): ExtendedPrismaClient {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = this.createPrismaClient();
    }

    return PrismaClientSingleton.instance;
  }
}

// Prisma 인스턴스를 생성
const prisma = PrismaClientSingleton.getInstance();

// 개발 환경에서만 Prisma 인스턴스를 전역 객체로 설정
if (process.env.NODE_ENV !== 'production') {
  (global as any).prisma = prisma;
}

// Prisma 인스턴스를 외부에서 사용할 수 있도록 export
export { ExtendedPrismaClient, prisma };
