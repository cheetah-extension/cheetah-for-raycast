// 遍历文件夹时获取的文件信息
export interface ChildInfo {
  name: string;
  path: string;
  isDir: boolean;
}

// 项目信息
export interface Project {
  id: string;
  name: string;
  path: string;
  type: string;
  hits: number;
  idePath: string;
}

export interface Config {
  editor: { [key: string]: string };
  cache: Project[];
}

export interface Preferences {
  workspace: string;
  ideName: string;
}
