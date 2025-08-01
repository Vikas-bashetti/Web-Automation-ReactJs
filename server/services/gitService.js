import simpleGit from 'simple-git';
import { promises as fs } from 'fs';
import path from 'path';

export class GitService {
  constructor() {
    this.tempDir = '/tmp/deployments';
    this.mainRepoUrl = process.env.MAIN_REPO_URL || 'https://github.com/your-org/main-build.git';
    this.appRepoUrl = process.env.APP_REPO_URL || 'https://github.com/your-org/app-configs.git';
    this.mainBranch = process.env.MAIN_BRANCH || 'main';
  }

  async cloneMainRepo() {
    const repoPath = path.join(this.tempDir, `main-${Date.now()}`);
    
    await fs.mkdir(repoPath, { recursive: true });
    
    const git = simpleGit();
    await git.clone(this.mainRepoUrl, repoPath, ['--branch', this.mainBranch, '--single-branch']);
    
    return repoPath;
  }

  async cloneAppFiles(appId) {
    const appPath = path.join(this.tempDir, `app-${appId}-${Date.now()}`);
    
    await fs.mkdir(appPath, { recursive: true });
    
    const git = simpleGit();
    await git.clone(this.appRepoUrl, appPath, ['--branch', appId, '--single-branch']);
    
    return appPath;
  }

  async mergeFiles(mainRepoPath, appFilesPath, appId) {
    const buildPath = path.join(this.tempDir, `build-${appId}-${Date.now()}`);
    
    // Copy main repository
    await this.copyDirectory(mainRepoPath, buildPath);
    
    // Overlay app-specific files
    const appSrcPath = path.join(appFilesPath, 'src'); // Assuming app files are in 'src' directory
    if (await this.pathExists(appSrcPath)) {
      await this.copyDirectory(appSrcPath, path.join(buildPath, 'src'), true);
    }
    
    // Copy other app-specific configs
    const configFiles = ['package.json', 'config.json', '.env', 'Dockerfile'];
    for (const file of configFiles) {
      const srcFile = path.join(appFilesPath, file);
      const destFile = path.join(buildPath, file);
      
      if (await this.pathExists(srcFile)) {
        await fs.copyFile(srcFile, destFile);
      }
    }
    
    return buildPath;
  }

  async copyDirectory(src, dest, overlay = false) {
    const stat = await fs.stat(src);
    
    if (stat.isDirectory()) {
      if (!overlay) {
        await fs.mkdir(dest, { recursive: true });
      }
      
      const files = await fs.readdir(src);
      
      for (const file of files) {
        if (file === '.git') continue; // Skip .git directories
        
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        
        await this.copyDirectory(srcPath, destPath, overlay);
      }
    } else {
      // Ensure destination directory exists
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.copyFile(src, dest);
    }
  }

  async pathExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}