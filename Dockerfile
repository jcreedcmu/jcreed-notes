FROM node:onbuild

RUN cd /usr/src/app
EXPOSE 80
CMD ["node", "/usr/src/app/index.js"]
