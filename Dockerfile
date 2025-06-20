# Caddy image I picked
FROM caddy:2.10.0-alpine
# Set the maintainer label
LABEL maintainer="herb@aptlantis.net"
# Set the description label
LABEL description="Caddy web server with static file serving. Or at least that is the plan. This Dockerfile sets up a Caddy server to serve static files from a specified directory, with necessary configurations and optimizations for production use."
# Set the version label
LABEL version="1.0"
# Set the license label
LABEL license="MIT"
# Copy the Caddy binary to the appropriate location
COPY --from=caddy:2.10.0-alpine /usr/bin/caddy /usr/bin/caddy
# Create necessary directories
RUN mkdir -p /etc/caddy /usr/share/caddy
# Set the user to run Caddy
USER caddy
# Set the environment variable for Caddy
ENV CADDYPATH /data
# Set the working directory for Caddy
WORKDIR /etc/caddy
# Set the user to run Caddy
USER caddy
# Set the environment variable for Caddy
ENV CADDYPATH /data
# Set the working directory for Caddy
WORKDIR /etc/caddy
# Copy the Caddyfile into the container
COPY data/etc/caddy/Caddyfile /etc/caddy/Caddyfile
# Expose port 80 for HTTP traffic
EXPOSE 80
# Expose port 443 for HTTPS traffic
EXPOSE 443
# Start Caddy server
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
# Note: Ensure that the Caddyfile and static directory are in the same directory as this Dockerfile
# when building the Docker image.
# To build the Docker image, run:
# docker build -t my-caddy-image .
# To run the Docker container, use:
# docker run -d -p 80:80 -p 443:443 my-caddy-image