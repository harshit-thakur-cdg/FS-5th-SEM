FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node package.json server.cjs ./
COPY --chown=node:node public ./public
ENV FRONTEND_HOST=0.0.0.0
USER node
EXPOSE 3000
CMD ["node","server.cjs"]
