import { ExtendedPrismaClient } from '../../library/database';
import { IPermission, IServiceResponse } from '../../types/config';
import { IEmployee } from '../../types/object';
import { IRequestDefaultList } from '../../types/request';
import { IPermissionService } from '../../types/service';
import { BaseService } from './service';

export class PermissionService extends BaseService implements IPermissionService {
  constructor(prisma: ExtendedPrismaClient) {
    super(prisma);
  }

  public async list(data: IRequestDefaultList): Promise<IServiceResponse<IPermission[]>> {
    try {
      // 페이지 번호가 없거나 1보다 작은 경우 1로 설정
      if (!data.page || data.page < 1) {
        data.page = 1;
      }

      // 페이지 크기가 작거나 너무 크면 10으로 설정
      if (!data.pageSize || data.pageSize < 1 || data.pageSize > 100) {
        data.pageSize = 10;
      }

      // 전체 직원 수 조회
      const total = await this.prisma.permission.count();

      // 권한 목록 조회
      // query 변수가 있으면 해당 문자열을 포함하는 권한 목록을 조회. data.query가 없으면 전체 권한 목록 조회
      const prismaResult = await this.prisma.permission.findMany({
        where: {
          title: data.query
            ? {
                contains: data.query,
              }
            : undefined,
        },
        skip: (data.page - 1) * data.pageSize,
        take: data.pageSize,
        orderBy: {
          id: 'asc', // 정렬 기준 추가
        },
      });

      const permissions: IPermission[] = prismaResult.map((permission) => {
        return {
          id: permission.id,
          title: permission.title,
          description: permission.description,
        };
      });

      // 메타데이터 생성
      const metadata = {
        total,
        page: data.page,
        pageSize: data.pageSize,
        start: (data.page - 1) * data.pageSize + 1,
        end: (data.page - 1) * data.pageSize + permissions.length,
        count: permissions.length,
        totalPage: Math.ceil(total / data.pageSize),
      };

      return { result: true, metadata, data: permissions };
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async updateEmployeesPermissions(
    employeeId: number,
    permissionIds: number[],
    grantedById: number
  ): Promise<IServiceResponse<IEmployee>> {
    try {
      // 직원 권한 수정
      const updatedEmployee = await this.prisma.employee.update({
        where: { id: employeeId },
        data: {
          permissions: {
            deleteMany: {}, // 기존 권한 매핑 모두 삭제
            create: permissionIds.map((permissionId) => ({
              permission: { connect: { id: permissionId } },
              grantedBy: { connect: { id: grantedById } },
              grantedAt: new Date(),
            })),
          },
        },
        include: {
          permissions: true,
        },
      });

      const employee: IEmployee = {
        id: updatedEmployee.id,
        email: updatedEmployee.email,
        name: updatedEmployee.name,
        position: updatedEmployee.position,
        description: updatedEmployee.description,
        phone: updatedEmployee.phone,
        mobile: updatedEmployee.mobile,
        address: updatedEmployee.address,
        hireDate: updatedEmployee.hireDate ? updatedEmployee.hireDate.toISOString() : undefined,
        birthDate: updatedEmployee.birthDate ? updatedEmployee.birthDate.toISOString() : undefined,
        fireDate: updatedEmployee.fireDate ? updatedEmployee.fireDate.toISOString() : undefined,
        isActivated: updatedEmployee.isActivated,
        permissions: updatedEmployee.permissions.map((permission) => permission.permissionId),
      };

      return { result: true, data: employee };
    } catch (error) {
      return this.handleError(error);
    }
  }
}
