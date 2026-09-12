import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

interface Photo {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  project?: string;
  date: string;
  location: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  year: string;
}

function readJsonFile<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function writeJsonFile(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function generateId(): string {
  return 'photo-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6);
}

function generateProjectId(): string {
  return 'proj-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4);
}

export default function localAdminPlugin(): Plugin {
  const photosPath = path.resolve(__dirname, '../src/data/photos.json');
  const projectsPath = path.resolve(__dirname, '../src/data/projects.json');
  const photosDir = path.resolve(__dirname, '../public/photos');

  return {
    name: 'local-admin-api',
    configureServer(server) {
      // 确保 photos 目录存在
      if (!fs.existsSync(photosDir)) {
        fs.mkdirSync(photosDir, { recursive: true });
      }

      // ==================== Photos API ====================

      // 获取所有照片
      server.middlewares.use('/api/photos', (req, res, next) => {
        if (req.method === 'GET' && req.url === '/') {
          try {
            const photos = readJsonFile<Photo[]>(photosPath);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(photos));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to read photos' }));
          }
          return;
        }
        next();
      });

      // 新增照片
      server.middlewares.use('/api/photos', (req, res, next) => {
        if (req.method === 'POST' && req.url === '/') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const photoData = JSON.parse(body);
              const photos = readJsonFile<Photo[]>(photosPath);
              const newPhoto: Photo = {
                id: generateId(),
                url: photoData.url || '',
                title: photoData.title || '',
                description: photoData.description || '',
                category: photoData.category || 'uncategorized',
                project: photoData.project || '',
                date: photoData.date || new Date().toISOString().split('T')[0],
                location: photoData.location || '',
              };
              photos.push(newPhoto);
              writeJsonFile(photosPath, photos);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(newPhoto));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to create photo' }));
            }
          });
          return;
        }
        next();
      });

      // 更新照片
      server.middlewares.use('/api/photos/', (req, res, next) => {
        if (req.method === 'PUT') {
          const id = req.url?.replace('/', '') || '';
          if (!id) { next(); return; }

          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const updateData = JSON.parse(body);
              const photos = readJsonFile<Photo[]>(photosPath);
              const index = photos.findIndex(p => p.id === id);
              if (index === -1) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Photo not found' }));
                return;
              }
              photos[index] = { ...photos[index], ...updateData, id };
              writeJsonFile(photosPath, photos);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(photos[index]));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to update photo' }));
            }
          });
          return;
        }
        next();
      });

      // 删除照片
      server.middlewares.use('/api/photos/', (req, res, next) => {
        if (req.method === 'DELETE') {
          const id = req.url?.replace('/', '') || '';
          if (!id) { next(); return; }

          try {
            const photos = readJsonFile<Photo[]>(photosPath);
            const filtered = photos.filter(p => p.id !== id);
            if (filtered.length === photos.length) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Photo not found' }));
              return;
            }
            writeJsonFile(photosPath, filtered);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to delete photo' }));
          }
          return;
        }
        next();
      });

      // ==================== Projects API ====================

      // 获取所有项目
      server.middlewares.use('/api/projects', (req, res, next) => {
        if (req.method === 'GET' && req.url === '/') {
          try {
            const projects = readJsonFile<Project[]>(projectsPath);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(projects));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to read projects' }));
          }
          return;
        }
        next();
      });

      // 新增项目
      server.middlewares.use('/api/projects', (req, res, next) => {
        if (req.method === 'POST' && req.url === '/') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const projectData = JSON.parse(body);
              const projects = readJsonFile<Project[]>(projectsPath);
              const newProject: Project = {
                id: projectData.id || generateProjectId(),
                title: projectData.title || '',
                description: projectData.description || '',
                cover_image: projectData.cover_image || '',
                year: projectData.year || new Date().getFullYear().toString(),
              };
              projects.push(newProject);
              writeJsonFile(projectsPath, projects);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(newProject));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to create project' }));
            }
          });
          return;
        }
        next();
      });

      // 更新项目
      server.middlewares.use('/api/projects/', (req, res, next) => {
        if (req.method === 'PUT') {
          const id = req.url?.replace('/', '') || '';
          if (!id) { next(); return; }

          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const updateData = JSON.parse(body);
              const projects = readJsonFile<Project[]>(projectsPath);
              const index = projects.findIndex(p => p.id === id);
              if (index === -1) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Project not found' }));
                return;
              }
              projects[index] = { ...projects[index], ...updateData, id };
              writeJsonFile(projectsPath, projects);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(projects[index]));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to update project' }));
            }
          });
          return;
        }
        next();
      });

      // 删除项目
      server.middlewares.use('/api/projects/', (req, res, next) => {
        if (req.method === 'DELETE') {
          const id = req.url?.replace('/', '') || '';
          if (!id) { next(); return; }

          try {
            const projects = readJsonFile<Project[]>(projectsPath);
            const filtered = projects.filter(p => p.id !== id);
            if (filtered.length === projects.length) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Project not found' }));
              return;
            }
            writeJsonFile(projectsPath, filtered);

            // 同时清除照片中对该项目的引用
            const photos = readJsonFile<Photo[]>(photosPath);
            const updatedPhotos = photos.map(p =>
              p.project === id ? { ...p, project: '' } : p
            );
            writeJsonFile(photosPath, updatedPhotos);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to delete project' }));
          }
          return;
        }
        next();
      });

      // ==================== Upload API ====================

      server.middlewares.use('/api/upload', (req, res, next) => {
        if (req.method !== 'POST') { next(); return; }

        const contentType = req.headers['content-type'] || '';
        if (!contentType.includes('multipart/form-data')) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Expected multipart/form-data' }));
          return;
        }

        // 简单的 multipart 解析
        let rawData = Buffer.alloc(0);
        req.on('data', chunk => {
          rawData = Buffer.concat([rawData, chunk]);
        });

        req.on('end', () => {
          try {
            const boundary = contentType.split('boundary=')[1];
            if (!boundary) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'No boundary found' }));
              return;
            }

            // 查找文件名
            const filenameMatch = rawData.toString('binary').match(/filename="([^"]+)"/);
            if (!filenameMatch) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'No file found' }));
              return;
            }

            let filename = filenameMatch[1];
            // 安全处理文件名
            filename = path.basename(filename);
            // 生成唯一文件名避免覆盖
            const ext = path.extname(filename);
            const baseName = path.basename(filename, ext);
            const timestamp = Date.now();
            const safeFilename = `${baseName}-${timestamp}${ext}`;

            // 查找文件内容的起始和结束位置
            const headerEndStr = '\r\n\r\n';
            const headerEndIndex = rawData.indexOf(headerEndStr);
            if (headerEndIndex === -1) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid form data' }));
              return;
            }

            const fileStart = headerEndIndex + headerEndStr.length;
            const boundaryBuffer = Buffer.from(`--${boundary}`);
            const fileEnd = rawData.indexOf(boundaryBuffer, fileStart) - 2; // -2 for \r\n

            if (fileEnd <= fileStart) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid file data' }));
              return;
            }

            const fileContent = rawData.slice(fileStart, fileEnd);
            const savePath = path.join(photosDir, safeFilename);
            fs.writeFileSync(savePath, fileContent);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              url: `/photos/${safeFilename}`,
              filename: safeFilename,
            }));
          } catch (err) {
            console.error('Upload error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Upload failed' }));
          }
        });
      });
    },
  };
}
