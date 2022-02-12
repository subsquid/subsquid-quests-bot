import { Sequelize} from 'sequelize-typescript'
import url from 'url';
import { Quest } from './models/quest';
import { Applicant } from './models/applicant';

const dbName = process.env.NODE_ENV;
const dbUrl = process.env.DATABASE_URL || `postgres://localhost:5432/${dbName}`;

const dbConfig = parseConnectionString(dbUrl);

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        database: dbConfig.database,
        host: dbConfig.host,
        port: dbConfig.port
      });
      sequelize.addModels([Quest, Applicant]);
      await sequelize.sync();
      return sequelize;
    },
  },
];

function parseConnectionString(connectionString: string): any {

  let config: any = {};
  let options: any = {}

  const urlParts = url.parse(connectionString);

  options.dialect = urlParts.protocol?.replace(/:$/, '');
  options.host = urlParts.hostname;

  if (urlParts.pathname) {
      config.database = urlParts.pathname.replace(/^\//, '');
  }

  if (urlParts.port) {
      options.port = urlParts.port;
  }

  if (urlParts.auth) {
      const authParts = urlParts.auth.split(':');

      config.username = authParts[0];

      if (authParts.length > 1)
          config.password = authParts.slice(1).join(':');
  }

  let result = Object.assign({}, config, options);

  return result;
}