# totallyweb
## Description
This is the front-end module of project. We are crafting a distinctly old-school aesthetic for our site, inspired by pixel art. The design is intentionally non-minimalist, featuring a bold color palette and rich with detailed elements.
It's Cinephile Hub: Review films, share your passion, and discover your next favorite movie. Join a community of film lovers, manage your watchlist, and stay updated with the latest news. 
## Technology Stack 
-  Proggraming languages: JavaScript, HTML, CSS
-  Web Framework: Next.js
-  Prototype Studio: Figma
## Link to to the prototypes of pages
https://www.figma.com/design/LCSz7x3rZoluZoh2JcoWtt/Untitled?node-id=0-1&t=cQkuHC7BYc8ZhbOu-1
## Link to to the API of server
API of server can be found in the BE repository https://github.com/edraithenni/totallyguysproject

## Report 4/4

# Frontend-Backend Network Setup via Cloudflare Tunnel
This report requires the frontend (Next.js) and backend (Gin) to run on different machines. We use Cloudflare Tunnel to expose the backend to the internet so that the frontend can access it without running the backend locally.

## 1. Backend Setup (Go REST API)
1. Install Go and dependencies.
2. Run the backend on port 8080:
bash:
go run main.go
Test locally:
curl http://localhost:8080/health

2. Cloudflare Tunnel Setup
    Install Cloudflare Tunnel (cloudflared)
    Authenticate with your Cloudflare account:
cloudflared login
    Run the tunnel to expose your backend:
cloudflared tunnel --url http://localhost:8080
    Note the generated public URL, e.g.:
https://random-subdomain.cloudflareTunnel.com
Note: Tunnel logs may show errors like:
ERR failed to serve tunnel connection error="control stream encountered a failure while serving"
Cloudflare automatically retries connections.

4. Frontend Setup (Next.js)
   In next.config.js, update the rewrites to point to the Cloudflare Tunnel URL:

        destination: 'https://random-subdomain.cloudflareTunnel.com/api/:path*',

    Run the frontend on another machine:
npm run dev
    The frontend now communicates with the backend through the tunnel.
