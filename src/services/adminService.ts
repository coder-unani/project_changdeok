import path from 'path';
import ejs from 'ejs';

export class AdminService {
  public async index(): Promise<string> {
    // EJS 템플릿 파일 경로 설정
    const templatePath = path.join(__dirname, '../views/admin/index.ejs');

    // 템플릿에 전달할 데이터
    const data = { 
      title: 'Admin Page', 
      message: 'Welcome to the admin page!',
      user: {
        name: 'John Doe',
        age: '40'
      }
    };

    // EJS 파일 렌더링
    return new Promise((resolve, reject) => {
      ejs.renderFile(templatePath, data, (err, html) => {
        if (err) {
          reject(err);
        } else {
          resolve(html);
        }
      });
    });
  }
}
