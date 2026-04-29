# cx330o Application Framework

Full-stack low code web framework for real world applications, in Python and JavaScript.

## Overview

A metadata-driven, full-stack web application framework that uses Python and MariaDB on the server side with a tightly integrated client-side library. Designed for building complex business applications.

### Key Features

- **Full-Stack Framework**: Covers both front-end and back-end development, allowing developers to build complete applications using a single framework.
- **Built-in Admin Interface**: Provides a pre-built, customizable admin dashboard for managing application data.
- **Role-Based Permissions**: Comprehensive user and role management system to control access and permissions.
- **REST API**: Automatically generated RESTful API for all models, enabling easy integration with other systems.
- **Customizable Forms and Views**: Flexible form and view customization using server-side scripting and client-side JavaScript.
- **Report Builder**: Powerful reporting tool that allows users to create custom reports without writing any code.

## Setup

### Docker

```bash
docker compose -f pwd.yml up -d
```

After a couple of minutes, the site should be accessible on localhost port 8080.
- Username: Administrator
- Password: admin

### Local Development

1. Install dependencies using the bench tool
2. Start the server:
   ```bash
   bench start
   ```
3. Create a new site:
   ```bash
   bench new-site mysite.localhost
   ```
4. Open `http://mysite.localhost:8000/app` in your browser

## License

MIT — See LICENSE file.
