import fs from 'fs';
import gracefulFs from 'graceful-fs';
import { ufs } from 'unionfs';
import { vol } from 'memfs';

ufs.use(vol as any).use({ ...fs });

const fs2 = gracefulFs.gracefulify(ufs)

export default fs2