#!/bin/bash
cd ..
# Reset and run migrations on test database
NODE_ENV=test npx sequelize-cli db:drop
NODE_ENV=test npx sequelize-cli db:create
NODE_ENV=test npx sequelize-cli db:migrate
npm test