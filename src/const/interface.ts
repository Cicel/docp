import Vinyl from 'vinyl';

export interface DocpConfig {
  src: string;
  dest: string;
  scripts: Array<string>;
  styles: Array<string>;
}

export interface ICode {
  origin: Vinyl | null,
  containerId: string,
  type: string,
  value: string
}