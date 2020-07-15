import Vinyl from 'vinyl';

interface MarkedOption {
  breaks?: boolean;
  gfm?: boolean;
  renderer?: object;
}

interface DocpConfig {
  src: string;
  dest: string;
  scripts: Array<string>;
  styles: Array<string>;
}

interface ExecableCode {
  origin: Vinyl | null;
  containerId: string;
  type: string;
  value: string;
}