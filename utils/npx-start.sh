#!/bin/bash
cd ..
npx sequelize-cli db:create
npm run migrate
npm run seed