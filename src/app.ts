import express, { Application } from 'express';
import path from 'path';
import apiRouter from './routes/apiRoutes';
import adminRouter from './routes/adminRoutes';


const app: Application = express();
const EXPRESS_PORT: number = 3000;

// EJS 뷰 엔진 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 정적 파일 설정
app.use(express.static(path.join(__dirname, 'public')));

// Body parser 설정
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 파싱
app.use(express.json()); // JSON 데이터 파싱

// 라우터 설정
app.use('/api', apiRouter);
app.use('/admin', adminRouter);

// 서버 실행
app.listen(EXPRESS_PORT, () => {
  console.log(`Server is running at http://localhost:${EXPRESS_PORT}`);
});