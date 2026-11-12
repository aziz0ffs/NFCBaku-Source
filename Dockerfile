FROM composer:2 AS dependencies
WORKDIR /app
COPY composer.json composer.lock ./
# Do not execute Laravel scripts while the production database/APP_KEY are absent.
RUN composer install --no-dev --no-interaction --prefer-dist --no-scripts --no-progress --ignore-platform-reqs

FROM php:8.2-apache
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpng-dev libjpeg62-turbo-dev libfreetype6-dev libzip-dev libicu-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) bcmath gd intl zip \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . /app
COPY --from=dependencies /app/vendor /app/vendor
COPY deploy/railway/apache.conf /etc/apache2/sites-available/000-default.conf
COPY deploy/railway/start.sh /usr/local/bin/linkstack-start
RUN chmod 755 /usr/local/bin/linkstack-start \
    && mkdir -p /app/storage/framework/{cache/data,sessions,views} /app/storage/logs /app/assets/img/background-img /app/bootstrap/cache \
    && chown -R www-data:www-data /app/storage /app/bootstrap/cache /app/assets/img /app/assets/linkstack/images

ENV PORT=8080
EXPOSE 8080
CMD ["/usr/local/bin/linkstack-start"]
