import { BetaAnalyticsDataClient } from '@google-analytics/data';

import { AppError, ForbiddenError, NotFoundError, TooManyRequestsError } from '../../common/error';
import { httpStatus } from '../../common/variables';
import { ExtendedPrismaClient } from '../../library/database';
import { IServiceResponse } from '../../types/config';
import { BaseService } from './service';

export class StatsService extends BaseService {
  private analyticsDataClient: BetaAnalyticsDataClient;

  constructor(prisma: ExtendedPrismaClient) {
    super(prisma);
    this.analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GA_CLIENT_EMAIL,
        private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
    });
  }

  public async getVisitorStats(startDate: string, endDate: string): Promise<IServiceResponse<any>> {
    try {
      // Convert KST dates to UTC for API request
      const utcStartDate = new Date(startDate + 'T00:00:00+09:00').toISOString().split('T')[0];
      const utcEndDate = new Date(endDate + 'T23:59:59+09:00').toISOString().split('T')[0];

      // 방문자 통계 데이터 조회
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${process.env.GA_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: utcStartDate,
            endDate: utcEndDate,
          },
        ],
        metrics: [{ name: 'activeUsers' }, { name: 'newUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
        dimensions: [{ name: 'date' }],
      });

      // 메트릭 값을 누적할 데이터 객체 생성
      const aggregatedData = {
        activeUsers: 0, // 총 활성 사용자 수
        newUsers: 0, // 총 신규 사용자 수
        sessions: 0, // 총 세션 수
        screenPageViews: 0, // 총 페이지 뷰 수
      };

      // 모든 행에 대해 메트릭 값을 누적
      response.rows?.forEach((row) => {
        row.metricValues?.forEach((value, index) => {
          const metricName = response.metricHeaders?.[index].name;
          if (metricName && value.value) {
            aggregatedData[metricName as keyof typeof aggregatedData] += parseInt(value.value);
          }
        });
      });

      // 메타데이터 생성
      const metadata = {
        startDate, // 조회 시작일
        endDate, // 조회 종료일
        rowCount: response.rows?.length || 0, // 조회 행 수
      };

      return {
        result: true,
        metadata,
        data: aggregatedData,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  public async getPageViews(startDate: string, endDate: string): Promise<IServiceResponse<any>> {
    try {
      // Convert KST dates to UTC for API request
      const utcStartDate = new Date(startDate + 'T00:00:00+09:00').toISOString().split('T')[0];
      const utcEndDate = new Date(endDate + 'T23:59:59+09:00').toISOString().split('T')[0];

      // 페이지뷰 통계 데이터 조회
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${process.env.GA_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: utcStartDate,
            endDate: utcEndDate,
          },
        ],
        metrics: [{ name: 'screenPageViews' }],
        dimensions: [{ name: 'pagePath' }],
        orderBys: [
          {
            metric: { metricName: 'screenPageViews' },
            desc: true,
          },
        ],
      });

      // 페이지별 페이지뷰 데이터 생성
      const pageViewsData =
        response.rows?.map((row) => ({
          pagePath: row.dimensionValues?.[0].value || '',
          views: parseInt(row.metricValues?.[0].value || '0'),
        })) || [];

      // 메타데이터 생성
      const metadata = {
        startDate, // 조회 시작일
        endDate, // 조회 종료일
        rowCount: response.rows?.length || 0, // 조회 행 수
      };

      return {
        result: true,
        metadata,
        data: pageViewsData,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  public async getCountryStats(startDate: string, endDate: string): Promise<IServiceResponse<any>> {
    try {
      // Convert KST dates to UTC for API request
      const utcStartDate = new Date(startDate + 'T00:00:00+09:00').toISOString().split('T')[0];
      const utcEndDate = new Date(endDate + 'T23:59:59+09:00').toISOString().split('T')[0];

      // 국가별 통계 데이터 조회
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${process.env.GA_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: utcStartDate,
            endDate: utcEndDate,
          },
        ],
        metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
        dimensions: [{ name: 'country' }],
        orderBys: [
          {
            metric: { metricName: 'activeUsers' },
            desc: true,
          },
        ],
      });

      // 국가별 통계 데이터 생성
      const countryData =
        response.rows?.map((row) => ({
          country: row.dimensionValues?.[0].value || '',
          activeUsers: parseInt(row.metricValues?.[0].value || '0'),
          sessions: parseInt(row.metricValues?.[1].value || '0'),
          pageViews: parseInt(row.metricValues?.[2].value || '0'),
        })) || [];

      // 메타데이터 생성
      const metadata = {
        startDate, // 조회 시작일
        endDate, // 조회 종료일
        rowCount: response.rows?.length || 0, // 조회 행 수
      };

      return {
        result: true,
        metadata,
        data: countryData,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  public async getReferrerStats(startDate: string, endDate: string): Promise<IServiceResponse<any>> {
    try {
      // Convert KST dates to UTC for API request
      const utcStartDate = new Date(startDate + 'T00:00:00+09:00').toISOString().split('T')[0];
      const utcEndDate = new Date(endDate + 'T23:59:59+09:00').toISOString().split('T')[0];

      // 유입처별 통계 데이터 조회
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${process.env.GA_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: utcStartDate,
            endDate: utcEndDate,
          },
        ],
        metrics: [{ name: 'sessions' }, { name: 'newUsers' }, { name: 'screenPageViews' }],
        dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
        orderBys: [
          {
            metric: { metricName: 'sessions' },
            desc: true,
          },
        ],
      });

      // 유입처별 통계 데이터 생성
      const referrerData =
        response.rows?.map((row) => ({
          source: row.dimensionValues?.[0].value || '',
          medium: row.dimensionValues?.[1].value || '',
          sessions: parseInt(row.metricValues?.[0].value || '0'),
          newUsers: parseInt(row.metricValues?.[1].value || '0'),
          pageViews: parseInt(row.metricValues?.[2].value || '0'),
        })) || [];

      // 메타데이터 생성
      const metadata = {
        startDate, // 조회 시작일
        endDate, // 조회 종료일
        rowCount: response.rows?.length || 0, // 조회 행 수
      };

      return {
        result: true,
        metadata,
        data: referrerData,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  public async getHourlyStats(startDate: string, endDate: string): Promise<IServiceResponse<any>> {
    try {
      // Convert KST dates to UTC for API request
      const utcStartDate = new Date(startDate + 'T00:00:00+09:00').toISOString().split('T')[0];
      const utcEndDate = new Date(endDate + 'T23:59:59+09:00').toISOString().split('T')[0];

      // 시간대별 통계 데이터 조회
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${process.env.GA_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: utcStartDate,
            endDate: utcEndDate,
          },
        ],
        metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
        dimensions: [{ name: 'hour' }],
        orderBys: [
          {
            dimension: { dimensionName: 'hour' },
            desc: false,
          },
        ],
      });

      // 시간대별 통계 데이터 생성
      const hourlyData =
        response.rows?.map((row) => ({
          hour: parseInt(row.dimensionValues?.[0].value || '0'),
          activeUsers: parseInt(row.metricValues?.[0].value || '0'),
          sessions: parseInt(row.metricValues?.[1].value || '0'),
          pageViews: parseInt(row.metricValues?.[2].value || '0'),
        })) || [];

      // 메타데이터 생성
      const metadata = {
        startDate, // 조회 시작일
        endDate, // 조회 종료일
        rowCount: response.rows?.length || 0, // 조회 행 수
      };

      return {
        result: true,
        metadata,
        data: hourlyData,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  public async getDailyVisitorStats(startDate: string, endDate: string): Promise<IServiceResponse<any>> {
    try {
      // Convert KST dates to UTC for API request
      const utcStartDate = new Date(startDate + 'T00:00:00+09:00').toISOString().split('T')[0];
      const utcEndDate = new Date(endDate + 'T23:59:59+09:00').toISOString().split('T')[0];

      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${process.env.GA_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: utcStartDate,
            endDate: utcEndDate,
          },
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'newUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
        ],
        dimensions: [{ name: 'date' }],
        orderBys: [
          {
            dimension: { dimensionName: 'date' },
            desc: false,
          },
        ],
      });

      // 일별 방문자 통계 데이터 생성
      const dailyData =
        response.rows?.map((row) => ({
          date: row.dimensionValues?.[0].value || '',
          activeUsers: parseInt(row.metricValues?.[0].value || '0'),
          newUsers: parseInt(row.metricValues?.[1].value || '0'),
          sessions: parseInt(row.metricValues?.[2].value || '0'),
          pageViews: parseInt(row.metricValues?.[3].value || '0'),
          averageSessionDuration: parseFloat(row.metricValues?.[4].value || '0'),
        })) || [];

      // 메타데이터 생성
      const metadata = {
        startDate, // 조회 시작일
        endDate, // 조회 종료일
        rowCount: response.rows?.length || 0, // 조회 행 수
      };

      return {
        result: true,
        metadata,
        data: dailyData,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  public async getBrowserStats(startDate: string, endDate: string): Promise<IServiceResponse<any>> {
    try {
      // Convert KST dates to UTC for API request
      const utcStartDate = new Date(startDate + 'T00:00:00+09:00').toISOString().split('T')[0];
      const utcEndDate = new Date(endDate + 'T23:59:59+09:00').toISOString().split('T')[0];

      // 브라우저별 통계 데이터 조회
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${process.env.GA_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: utcStartDate,
            endDate: utcEndDate,
          },
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
        ],
        dimensions: [{ name: 'browser' }],
        orderBys: [
          {
            metric: { metricName: 'activeUsers' },
            desc: true,
          },
        ],
      });

      // 브라우저별 통계 데이터 생성
      const browserData =
        response.rows?.map((row) => ({
          browser: row.dimensionValues?.[0].value || '',
          activeUsers: parseInt(row.metricValues?.[0].value || '0'),
          sessions: parseInt(row.metricValues?.[1].value || '0'),
          pageViews: parseInt(row.metricValues?.[2].value || '0'),
          averageSessionDuration: parseFloat(row.metricValues?.[3].value || '0'),
        })) || [];

      // 메타데이터 생성
      const metadata = {
        startDate,
        endDate,
        rowCount: response.rows?.length || 0,
      };

      return {
        result: true,
        metadata,
        data: browserData,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  public async getAccessLogs(date: string): Promise<IServiceResponse<any>> {
    try {
      const logPath = `logs/info-${date}.log`;
      const gzLogPath = `logs/info-${date}.log.gz`;
      const fs = require('fs');
      const zlib = require('zlib');
      const path = require('path');

      let logContent = '';

      // Check if file exists
      if (fs.existsSync(logPath)) {
        try {
          logContent = fs.readFileSync(logPath, 'utf8');
        } catch (error) {
          throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, '로그 파일을 읽는 중 오류가 발생했습니다.');
        }
      } else if (fs.existsSync(gzLogPath)) {
        try {
          // gzip 파일 압축 해제
          const compressed = fs.readFileSync(gzLogPath);
          logContent = zlib.gunzipSync(compressed).toString('utf8');
        } catch (error) {
          throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, '압축된 로그 파일을 해제하는 중 오류가 발생했습니다.');
        }
      } else {
        throw new NotFoundError('해당 날짜의 로그 파일을 찾을 수 없습니다.');
      }

      if (!logContent) {
        throw new NotFoundError('로그 파일이 비어있습니다.');
      }

      // Parse log entries
      const logEntries = logContent
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => {
          try {
            const parts = line.split(' || ');
            if (parts.length < 9) return null;

            const path = parts[0].split(' - ')[2];
            // Skip entries where path starts with /api
            if (path.startsWith('/api')) return null;

            return {
              timestamp: parts[0].split(' - ')[0],
              level: parts[0].split(' - ')[1],
              path: path,
              method: parts[1],
              status: parts[2],
              ip: parts[3],
              origin: parts[4],
              referer: parts[5],
              userAgent: parts[7],
              host: parts[8],
            };
          } catch (error) {
            throw new NotFoundError('로그 파일이 비어있습니다.');
          }
        })
        .filter((entry) => entry !== null)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      if (logEntries.length === 0) {
        throw new NotFoundError('유효한 로그 데이터가 없습니다.');
      }

      return {
        result: true,
        metadata: {
          date,
          totalRequests: logEntries.length,
        },
        data: logEntries,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
