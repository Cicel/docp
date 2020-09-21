# Options

Here is the list of options that  `Docp` supported.

| name       | supported scene                       | type            | default value     | describe                                                     |
| :--------- | ------------------------------------- | --------------- | ----------------- | ------------------------------------------------------------ |
| rootDir    | command line args, configuration file | string          | current directory | Specifies the root directory of input files                  |
| outDir     | command line args, configuration file | string          | docsite           | Specifies the directory for output files                     |
| file       | command line args, configuration file | string          | N/A               | Specifies the file to be compiled. Mutually exclusive with rootDir |
| port       | command line args, configuration file | number          | 3000              | Specify local server port                                    |
| configPath | command line args                     | string          | docp.config.js    | Specify the configuration file path when init                |
| template   | command line args, configuration file | string          | N/A               | Specify the HTML template to replace the built-in template   |
| scripts    | configuration file                    | Array\<string\> | N/A               | External scripts included in HTML template, Commonly used for public libraries like React or Vue |
| styles     | configuration file                    | Array\<string\> | N/A               | External styles included in HTML template                    |
| marked     | configuration file                    | object          | N/A               | Marked options                                               |
| plugin     | configuration file                    | object          | N/A               | Plugins for custom code                                      |
| header     | configuration file                    | object          | N/A               | Header of page                                               |

