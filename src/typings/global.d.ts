import Vinyl from 'vinyl';

interface MarkedOption {
  baseUrl: string,
  breaks: boolean,
  gfm: boolean
}

interface DocpConfig {
  src: string;
  dest: string;
  scripts: Array<string>;
  styles: Array<string>;
}

interface ICode {
  origin: Vinyl | null,
  containerId: string,
  type: string,
  value: string
}