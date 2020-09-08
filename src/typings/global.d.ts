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
  codeBlockString: string;
  containerId: string;
  type: string;
  value: string;
}

interface PageHeader {
  name: string;
  logo: string;
  navigation: Array<Nav>;
}

interface Nav {
  value: string;
  href: string;
  target: string;
}