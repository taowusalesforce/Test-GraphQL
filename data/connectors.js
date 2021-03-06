/*
  Create seed data (clears database tables; schema operations should be kept to SpringBoot to
  keep things from getting too complex and error prone). This PersonModel reflects the exact
  database columns and types and we use it here in our server as the entity representation for
  all operations on Person.
*/
import Sequelize from "sequelize";
import casual from "casual";
import _ from "lodash";

/*
    @TODO parameterize connection info per environment
    Sequelize('database', 'username', 'password');
    const db = new Sequelize("taopsql", "taopsql", "taopsql", {
*/
const db = new Sequelize("den4j9m1o09qek", "jyjlyyllutfqbu", "432a6cc0aecbe443a6adc16b8d674075908444042e4f6ff981d98b0ca187db68", {
  host: "ec2-54-225-192-243.compute-1.amazonaws.com",
  dialect: "postgres",

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },

  define: {
    //prevent sequelize from pluralizing table names
    freezeTableName: true,
    timestamps: false
  }
  
});

const PersonModel = db.define("person", {
  id: { type: Sequelize.INTEGER, primaryKey: true },
  first_name: { type: Sequelize.STRING },
  last_name: { type: Sequelize.STRING }
});

// create mock data with a seed and same baseline id, so we always get the same data;
let counter = 0;
casual.seed(123);
PersonModel.destroy({ where: {} }).then(() => {
  _.times(10, () => {
    return PersonModel.create({
      id: counter++,
      first_name: casual.first_name,
      last_name: casual.last_name
    });
  });
});

const Person = db.models.person;

export { Person };
