# Remote discovery (read-only)

## purpose
- Discover remote Docker surface for ORGM Astro dashboard SDD base input.
- Gather containers, images, ports, compose metadata, networks, and volumes without mutating state.

## remote host
- host: `osmarg@10.0.0.13`
- requested auth target: `osmarg@10.0.0.13`
- timestamp: 2026-06-05T00:00:00Z (local capture just now)

## discovery commands run
- `ssh -o BatchMode=yes -o ConnectTimeout=20 osmarg@10.0.0.13 "docker ps -a --format \"{{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}\""`
- `ssh -o BatchMode=yes -o ConnectTimeout=20 osmarg@10.0.0.13 "docker images --format \"table {{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.Size}}\t{{.CreatedSince}}\""`
- `ssh -o BatchMode=yes -o ConnectTimeout=20 osmarg@10.0.0.13 "docker network ls --format \"{{.Name}}\t{{.Driver}}\t{{.Scope}}\t{{.ID}}\""`
- `ssh -o BatchMode=yes -o ConnectTimeout=20 osmarg@10.0.0.13 "docker volume ls -q"`
- `ssh -o BatchMode=yes -o ConnectTimeout=20 osmarg@10.0.0.13 "docker inspect $(docker ps -aq)"`
- `ssh -o BatchMode=yes -o ConnectTimeout=20 osmarg@10.0.0.13 "docker inspect $(docker ps --format \"{{.Names}}\") --format '{{.Name}}|{{json .Config.Env}}'"` (for URL/env hint extraction)

## containers table (name/image/status/ports/compose project/network hints)
| name | image | status | ports | compose project / service | network hints |
| --- | --- | --- | --- | --- | --- |
| dagendang-web | orgmcr.or-gm.com/osmargm1202/dagendang:v2 | Up 7 hours | 127.0.0.1:3010->3000/tcp | / / | nginx_proxy_network |
| msg-orgm | orgmcr.or-gm.com/osmargm1202/msg-orgm:v1 | Up 7 hours | 80/tcp, 0.0.0.0:4321->4321/tcp, [::]:4321->4321/tcp | msg-orgm/msg-orgm | nginx_proxy_network |
| dagendang-web-prev-20260604134934 | 3a6667963009 | Exited (0) 7 hours ago |  | / / | nginx_proxy_network |
| analisis-edes | orgmcr.or-gm.com/osmargm1202/analisis-edes:v1 | Up 9 hours (healthy) | 8000/tcp | analisis-edes/analisis-edes | nginx_proxy_network |
| portainer | portainer/portainer-ce:lts | Up 20 hours | 9000/tcp, 0.0.0.0:9443->9443/tcp, [::]:9443->9443/tcp, 0.0.0.0:8002->8000/tcp, [::]:8002->8000/tcp | / / | bridge, nginx_proxy_network |
| filebrowser | docker.io/filebrowser/filebrowser:s6 | Up 20 hours (healthy) | 0.0.0.0:8084->80/tcp, [::]:8084->80/tcp | filebrowser/filebrowser | nginx_proxy_network |
| LibreChat | ghcr.io/danny-avila/librechat-dev:latest | Up 20 hours | 0.0.0.0:3080->3080/tcp, [::]:3080->3080/tcp | librechat/api | librechat_default, nginx_proxy_network |
| chat-mongodb | mongo:latest | Up 23 seconds | 27017/tcp | librechat/mongodb | librechat_default |
| nginx-proxy-manager | jc21/nginx-proxy-manager:latest | Up 44 hours | 0.0.0.0:80-81->80-81/tcp, [::]:80-81->80-81/tcp, 0.0.0.0:443->443/tcp, [::]:443->443/tcp | nginx_proxy_manager/nginx-proxy-manager | nginx_proxy_network |
| romm-db | mariadb:latest | Up 44 hours (healthy) | 3306/tcp | romm/romm-db | romm_romm_network |
| n8n | docker.n8n.io/n8nio/n8n:latest | Up 44 hours | 0.0.0.0:5678->5678/tcp, [::]:5678->5678/tcp | n8n/n8n | nginx_proxy_network |
| open_webui | ghcr.io/open-webui/open-webui:main | Up 44 hours | 0.0.0.0:3008->8080/tcp, [::]:3008->8080/tcp | / / | bridge, nginx_proxy_network |
| webodm-node-odm-1 | opendronemap/nodeodm:latest | Up 3 days | 3000/tcp | webodm/node-odm | webodm_default |
| uptime-kuma | louislam/uptime-kuma:2 | Up 4 days (healthy) | 0.0.0.0:3001->3001/tcp, [::]:3001->3001/tcp | uptime-kuma/uptime-kuma | nginx_proxy_network |
| pyload | lscr.io/linuxserver/pyload-ng:latest | Up 5 days | 0.0.0.0:9666->7227/tcp, [::]:9666->7227/tcp, 0.0.0.0:8001->8000/tcp, [::]:8001->8000/tcp | / / | bridge, nginx_proxy_network |
| dagendang-web-prev-20260604123708 | 35190d04f2ca | Exited (0) 8 hours ago |  | / / | nginx_proxy_network |
| dagendang-web-prev-20260529203002 | 6209f1e23313 | Exited (6 days ago) |  | / / | bridge, nginx_proxy_network |
| dagendang-strapi | dagendang-dagendang-strapi | Up 8 hours | 0.0.0.0:1337->1337/tcp, [::]:1337->1337/tcp | dagendang/dagendang-strapi | dagendang-network, nginx_proxy_network |
| insforge-postgres-1 | ghcr.io/insforge/postgres-all:latest | Up 5 days (healthy) | 0.0.0.0:5432->5432/tcp | insforge/postgres | insforge_insforge-internal |
| insforge-deno-1 | ghcr.io/insforge/deno-runtime:latest | Up 5 days (healthy) | 0.0.0.0:7133->7133/tcp | insforge/deno | insforge_insforge-internal |
| cloudflared | cloudflare/cloudflared:latest | Up 5 days |  | / / | nginx-proxy-network, nginx_proxy_network |
| qbittorrent | lscr.io/linuxserver/qbittorrent:latest | Up 5 days | 0.0.0.0:6881->6881/tcp, [::]:6881->6881/tcp, 0.0.0.0:8082->8082/tcp, [::]:8082->8082/tcp, 0.0.0.0:6881->6881/udp, [::]:6881->6881/udp | / / | bridge, nginx_proxy_network |
| redis | redis:latest | Up 5 days | 0.0.0.0:6379->6379/tcp, [::]:6379->6379/tcp | / / | db_proxy_network, nginx_proxy_network |
| jellyfin | jellyfin/jellyfin:latest | Up 5 days (healthy) | 0.0.0.0:7359->7359/udp, [::]:7359->7359/udp, 0.0.0.0:8096->8096/tcp, [::]:8096->8096/tcp | jellyfin/jellyfin | bridge, jellyfin_default, nginx_proxy_network |
| orgm-lp | orgmcr.or-gm.com/osmargm1202/orgm-landing-page:v2 | Up 5 days | 0.0.0.0:3009->3000/tcp, [::]:3009->3000/tcp | orgm-landing-page/orgm-landing-page | nginx_proxy_network |
| dagendang-postgres | postgres:16-alpine | Up 5 days (healthy) | 5432/tcp | dagendang/dagendang-postgres | dagendang-network |
| dagendang-minio | minio/minio:latest | Up 5 days (healthy) | 0.0.0.0:9000->9000/tcp, [::]:9000->9000/tcp, 0.0.0.0:9001->9001/tcp, [::]:9001->9001/tcp | dagendang/dagendang-minio | dagendang-network, nginx_proxy_network |
| dagendang-redis | redis:7-alpine | Up 5 days (healthy) | 6379/tcp | dagendang/dagendang-redis | dagendang-network |
| postgrest | postgrest/postgrest:latest | Up 5 days | 0.0.0.0:3006->3000/tcp, [::]:3006->3000/tcp | / / | bridge, db_proxy_network |
| insforge-insforge-1 | ghcr.io/insforge/insforge-oss:v1.5.0 | Up 5 days | 0.0.0.0:7130->7130/tcp, 0.0.0.0:7131->7131/tcp | insforge/insforge | insforge_insforge-internal, nginx-proxy-network |
| insforge-postgrest-1 | postgrest/postgrest:v12.2.12 | Up 5 days | 0.0.0.0:5430->3000/tcp | insforge/postgrest | insforge_insforge-internal |
| n8n_postgres | postgres:16-alpine | Up 5 days (healthy) | 5432/tcp | n8n/postgres | nginx_proxy_network |
| healthchecks-db | postgres:15-alpine | Up 5 days (healthy) | 5432/tcp | healthchecks/db | healthchecks_default |
| pihole | pihole/pihole:latest | Up 5 days (healthy) | 0.0.0.0:53->53/tcp, 0.0.0.0:53->53/udp, 0.0.0.0:8086->80/tcp, [::]:8086->80/tcp, 0.0.0.0:8443->443/tcp, [::]:8443->443/tcp | pihole/pihole | nginx_proxy_network |
| homepage | ghcr.io/gethomepage/homepage:latest | Up 5 days (healthy) | 0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp | homepage/homepage | nginx_proxy_network |
| radisson-paneles | orgmcr.or-gm.com/radisson-paneles:v1 | Up 5 days | 0.0.0.0:8080->80/tcp, [::]:8080->80/tcp | radisson/radisson-paneles | bridge, nginx_proxy_network |
| adminer | adminer:latest | Up 5 days | 0.0.0.0:8081->8080/tcp, [::]:8081->8080/tcp | / / | db_proxy_network, nginx_proxy_network |
| vaultwarden | vaultwarden/server:latest | Up 5 days (healthy) | 0.0.0.0:8088->80/tcp, [::]:8088->80/tcp | vaultwarden/vaultwarden | nginx_proxy_network |
| healthchecks | healthchecks/healthchecks:latest | Up 5 days (healthy) | 0.0.0.0:8087->8000/tcp, [::]:8087->8000/tcp | healthchecks/web | healthchecks_default |
| rag_api | ghcr.io/danny-avila/librechat-rag-api-dev-lite:latest | Up 5 days |  | librechat/rag_api | librechat_default |
| immich_machine_learning | ghcr.io/immich-app/immich-machine-learning:v2 | Up 5 days (healthy) |  | immich/immich-machine-learning | immich_default |
| immich_server | ghcr.io/immich-app/immich-server:v2 | Up 5 days (healthy) | 0.0.0.0:2283->2283/tcp, [::]:2283->2283/tcp | immich/immich-server | immich_default, nginx_proxy_network |
| worker | opendronemap/webodm_webapp:latest | Up 5 days |  | webodm/worker | webodm_default |
| webapp | opendronemap/webodm_webapp:latest | Up 5 days | 0.0.0.0:8000->8000/tcp, [::]:8000->8000/tcp | webodm/webapp | nginx_proxy_network, webodm_default |
| romm | rommapp/romm:latest | Up 5 days | 0.0.0.0:8083->8080/tcp, [::]:8083->8080/tcp | romm/romm | bridge, nginx_proxy_network, romm_romm_network |
| registry | registry:3.0.0 | Up 5 days | 0.0.0.0:5000->5000/tcp, [::]:5000->5000/tcp | docker-registry/registry | nginx_proxy_network |
| orgmdns | orgmcr.or-gm.com/osmargm1202/orgmdns:latest | Up 5 days |  | orgmdns/orgmdns | orgmdns_default |
| orgmserver | orgmcr.or-gm.com/osmargm1202/orgmserver:latest | Up 5 days |  | orgmserver/orgmserver | orgmserver_default |
| dockerproxy | docker.io/tecnativa/docker-socket-proxy:latest | Up 5 days | 127.0.0.1:2375->2375/tcp | / / | bridge, nginx_proxy_network |
| appsmith | appsmith/appsmith-ce:v1.73.1 | Up 5 days | 0.0.0.0:1080->80/tcp, [::]:1080->80/tcp, 0.0.0.0:10443->443/tcp, [::]:10443->443/tcp | big-bear-appsmith/app | big-bear-appsmith_default |
| dashy | lissy93/dashy:3.1.0 | Up 5 days (healthy) | 0.0.0.0:4000->8080/tcp, [::]:4000->8080/tcp | big-bear-dashy/big-bear-dashy | big-bear-dashy_default |
| 2fauth | 2fauth/2fauth:5.4.3 | Up 5 days | 0.0.0.0:8090->8000/tcp, [::]:8090->8000/tcp | 2fauth/2fauth | bridge |
| vectordb | pgvector/pgvector:0.8.0-pg15-trixie | Up 5 days | 5432/tcp | librechat/vectordb | librechat_default |
| chat-meilisearch | getmeili/meilisearch:v1.12.3 | Up 5 days | 7700/tcp | librechat/meilisearch | librechat_default |
| watchtower | containrrr/watchtower | Up 5 days (healthy) | 127.0.0.1:8085->8080/tcp | watchtower/watchtower | nginx_proxy_network |
| immich_postgres | ghcr.io/immich-app/postgres:14-vectorchord0.4.3-pgvector... | Up 5 days | 5432/tcp | immich/database | immich_default |
| immich_redis | docker.io/valkey/valkey:8@sha256:81db6d... | Up 5 days | 6379/tcp | immich/redis | immich_default |
| orgm_nextjs | orgm-nextjs | Up 5 days |  | orgm_nextjs/app |  |
| db | opendronemap/webodm_db | Up 5 days | 5432/tcp | webodm/db | webodm_default |
| broker | redis:7.0.10 | Up 5 days |  | webodm/broker | webodm_default |

## images
```text
dockurr/windows:latest                                      1d1c11048017   387MB     6 months ago
archlinux:latest                                            05596ed38deb   397MB     2 months ago
orgmcr.or-gm.com/osmargm1202/windows11:latest               7d6c2d942370   780MB     2 months ago
orgmcr.or-gm.com/osmargm1202/arch:gpu                        151fefc6ef0d   14.6GB    2 months ago
nginx:1.27-alpine                                           6769dc3a703c   49.7MB    13 months ago
alpine:3.20                                                bf8527eb54c3   8.1MB     7 weeks ago
node:22-alpine                                             dd720352b069   165MB     3 weeks ago
minio/mc:latest                                            c2ad77420d33   85.5MB    9 months ago
minio/minio:latest                                          69b2ec208575   176MB    9 months ago
redis:7-alpine                                              487e9f0d8638   39.9MB    4 weeks ago
postgres:16-alpine                                          fff3594bf464   279MB    3 weeks ago
moby/buildkit:buildx-stable-1                               6db049f808b3   243MB    3 weeks ago
dagendang-dagendang-strapi:latest                           42323eb3d8a9   973MB    2 weeks ago
orgmcr.or-gm.com/osmargm1202/orgm-landing-page:v2             bb56e9df7734   930MB    13 days ago
orgmcr.or-gm.com/osmargm1202/analisis-edes:v1                a77e5fd61b1e   1.04GB    10 hours ago
orgmcr.or-gm.com/osmargm1202/msg-orgm:v1                    14b3a0f0d9ff   49.7MB    7 hours ago
```

## networks
```text
big-bear-appsmith_default	bridge	local
big-bear-dashy_default	bridge	local
dagendang-network	bridge	local
db_proxy_network	bridge	local
discord_dota-bot-network	bridge	local
healthchecks_default	bridge	local
homepage_default	bridge	local
host	host	local
immich_default	bridge	local
insforge_insforge-internal	bridge	local
jellyfin_default	bridge	local
librechat_default	bridge	local
nginx-proxy-network	bridge	local
nginx_proxy_network	bridge	local
orgmdns_default	bridge	local
orgmserver_default	bridge	local
radisson_default	bridge	local
romm_romm_network	bridge	local
watchtower_default	bridge	local
watchtower_internal	bridge	local
webodm_default	bridge	local
```

## volumes
```text
0b48036ebcdd345d1f8f0df78c9651a69d7b31b8fafb4cae6f67d29c28719077
0bd38467340f8f99c187af5776c0445ff9a1f980e9dfadf41f1e643622c0066a
1b473e07183cda7ba64ee265c8157fa67ab9deee8c88598412ccf75226d3da79
2c5759364cb13a62ef03ea4fc1ec31f8e4be6e21f37eb53db5a45024c49a243f
4cb3e278ca330d46cb0a03cb9ac7bed4f6b9f194b1a66461896db9cd0197b917
4ce788352617264b06b52637ef4a9e1f5eab6dc022c594b87d10e566245098c6
5bcdfc3874c3ddc0f01919f550e7b09ef148d5f79c814b71475a606269daa336
5d171fb9bfb37076bf77dc0724b25b09d5776b48417e1c3c70a20cd018ef7a5b
8ac1002a9556d62d1594f48b5de74fca1e42402631a85ac2d93846767fd91023
8b5d7810eb704207cba7a6d31f6d8d50489de3926af9b1d8f5cf58171f4e597e
21dce8e6e2e2d5477549e7c73e5e9121b5fa914f98a32372bf7a57f2dc7ee1b9
42cd0bdb9f34deae05534e55419922103e1f0756a8f45726b8f88501b824bf88
43cc955871a449f7acddda4c8dba29575e7c5d4aaec9988fb2410029ce081544
436f4e40e411aac923aa64636c748a9978c28f94792d513702088c31c20dbeac
845ab6d756a006496189c02c210a5312b7e8de8cebb091e86ef1b1036dc4eb68
917f1ee7f4aee0dcb0f1e6ff1e58eef36d8c470afd82bc57cdca1bdffa29f933
4411ce45d98e2ae4e514e6d8a062683581e7a7b1bdcd346a09e8ed60e0346c3e
6672c79ece643b7f4737b365c57f6b94391c6c8aabc62be2057ae63cf8760339
15751cfda9d55b7adf0299be4fb74bb115b1557aa4d957974e5c591397557869
870080fb5a8823fd41bab38b990a0fcd8ba95b26caa5c6fe5f3f75d819e5b330
af7671c4e25359e0e55136ca6264819fe11c0ff8d6d529a0cdaa773f8cea0988
authentik_database
b7aaa43bd605537c5fdeed8046c98ea9fb7f8035aa339a6d55e84b46f15d6088
b5909ea925e747ee9788b5f4018f038d80411f19cb29fbef202143657967f63f
b599657cc561278ca8feacc11508be1308e5618b4d635014c6159e0c28478ae2
de2b2960c03b74a338284835101b6bca2e93face4ae0882bc710cf982634f2d8
docker-registry_prometheus-data
e55555a8fcdae8a8b95cbd229650561d45dea28b6597fc6ec471f077fdab9794
f9a8b65815eacf355b6dd5e4fb83f82e5bca02cab233daed1345cb87ae4526f3
immich_model-cache
librechat_pgdata2
n8n_data
n8n_postgres_data
nginx-data
nginx-letsencrypt
nginx_proxy_manager_custom
nginx_proxy_manager_nginx-data
nginx_proxy_manager_nginx-letsencrypt
open-webui
orgm_img
orgm_portada
portainer_data
postgres_data
redis-data
webodm_appmedia
webodm_dbdata
```

## candidate dashboard entries
| container | compose | image | networks | ports | service URLs / env hints | internal/public URL unknown |
| --- | --- | --- | --- | --- | --- | --- |
| dagendang-web | - | orgmcr.or-gm.com/osmargm1202/dagendang:v2 | nginx_proxy_network | 127.0.0.1:3010->3000 | STRAPI_API_URL=https://admin.dagendang.com; NEXT_PUBLIC_SITE_URL=https://dagendang.com; NEXT_PUBLIC_STRAPI_ASSETS_URL=https://s3.dagendang.com/dagendang-assets | host mapped; public host/path unknown |
| msg-orgm | msg-orgm/msg-orgm | orgmcr.or-gm.com/osmargm1202/msg-orgm:v1 | nginx_proxy_network | 0.0.0.0:4321->4321 | - | host mapped; public host/path unknown |
| filebrowser | filebrowser/filebrowser | docker.io/filebrowser/filebrowser:s6 | nginx_proxy_network | 0.0.0.0:8084->80 | - | host mapped; public host/path unknown |
| LibreChat | librechat/api | ghcr.io/danny-avila/librechat-dev:latest | librechat_default, nginx_proxy_network | 0.0.0.0:3080->3080 | HOST=0.0.0.0 (no explicit domain in this filter) | host mapped; public host/path unknown |
| nginx-proxy-manager | nginx_proxy_manager/nginx-proxy-manager | jc21/nginx-proxy-manager:latest | nginx_proxy_network | 0.0.0.0:80-81->80-81; 0.0.0.0:443->443 | - | host mapped; public host/path unknown |
| n8n | n8n/n8n | docker.io/docker.n8n.io/n8nio/n8n:latest | nginx_proxy_network | 0.0.0.0:5678->5678 | - | host mapped; public host/path unknown |
| open_webui | - | ghcr.io/open-webui/open-webui:main | bridge, nginx_proxy_network | 0.0.0.0:3008->8080 | - | host mapped; public host/path unknown |
| uptime-kuma | uptime-kuma/uptime-kuma | louislam/uptime-kuma:2 | nginx_proxy_network | 0.0.0.0:3001->3001 | - | host mapped; public host/path unknown |
| pyload | - | lscr.io/linuxserver/pyload-ng:latest | bridge, nginx_proxy_network | 0.0.0.0:9666->7227; 0.0.0.0:8001->8000 | - | host mapped; public host/path unknown |
| dagendang-strapi | dagendang/dagendang-strapi | dagendang-dagendang-strapi | dagendang-network, nginx_proxy_network | 0.0.0.0:1337->1337 | - | host mapped; public host/path unknown |
| insforge-insforge-1 | insforge/insforge | ghcr.io/insforge/insforge-oss:v1.5.0 | insforge_insforge-internal, nginx-proxy-network | 0.0.0.0:7130->7130; 0.0.0.0:7131->7131 | - | host mapped; public host/path unknown |
| pihole | pihole/pihole | pihole/pihole:latest | nginx_proxy_network | 0.0.0.0:53->53; 0.0.0.0:8086->80; 0.0.0.0:8443->443 | - | host mapped; likely public DNS required |
| homepage | homepage/homepage | ghcr.io/gethomepage/homepage:latest | nginx_proxy_network | 0.0.0.0:3000->3000 | HOMEPAGE_ALLOWED_HOSTS=* (unsafe default), OPENAI_API_KEY=[REDACTED] | host mapped; public host/path unknown |
| radisson-paneles | radisson/radisson-paneles | orgmcr.or-gm.com/radisson-paneles:v1 | bridge, nginx_proxy_network | 0.0.0.0:8080->80 | - | host mapped; public host/path unknown |
| adminer | - | adminer:latest | db_proxy_network, nginx_proxy_network | 0.0.0.0:8081->8080 | ADMINER_DEFAULT_PASSWORD=[REDACTED]; ADMINER_DEFAULT_SERVER=172.20.0.3; ADMINER_DEFAULT_USERNAME=[REDACTED] | host mapped; internal DB helper; public uncertain |
| vaultwarden | vaultwarden/vaultwarden | vaultwarden/server:latest | nginx_proxy_network | 0.0.0.0:8088->80 | DOMAIN=https://vw.or-gm.com (domain hint), ADMIN_TOKEN=[REDACTED], SIGNUPS_DOMAINS_WHITELIST=or-gm.com,fifrex.com | public domain hinted; public host route not confirmed |
| healthchecks | healthchecks/web | healthchecks/healthchecks:latest | healthchecks_default | 0.0.0.0:8087->8000 | ALLOWED_HOSTS=10.0.0.13,localhost,127.0.0.1,hc.or-gm.com; SITE_ROOT=https://hc.or-gm.com | public domain hinted; public host route not confirmed |
| immich_server | immich/immich-server | ghcr.io/immich-app/immich-server:v2 | immich_default, nginx_proxy_network | 0.0.0.0:2283->2283 | - | host mapped; public host/path unknown |
| webapp | webodm/webapp | opendronemap/webodm_webapp:latest | nginx_proxy_network, webodm_default | 0.0.0.0:8000->8000 | - | host mapped; public host/path unknown |
| romm | romm/romm | rommapp/romm:latest | bridge, nginx_proxy_network, romm_romm_network | 0.0.0.0:8083->8080 | DB_HOST=romm-db; DB_NAME=romm; DB_USER=[REDACTED]; DB_PASSWD=[REDACTED]; IGDB_CLIENT_ID=[REDACTED] | host mapped; internal DB dependency |
| registry | docker-registry/registry | registry:3.0.0 | nginx_proxy_network | 0.0.0.0:5000->5000 | - | host mapped; public host/path unknown |
| appsmith | big-bear-appsmith/app | appsmith/appsmith-ce:v1.73.1 | big-bear-appsmith_default | 0.0.0.0:1080->80; 0.0.0.0:10443->443 | - | host mapped; public host/path unknown |
| dashy | big-bear-dashy/big-bear-dashy | lissy93/dashy:3.1.0 | big-bear-dashy_default | 0.0.0.0:4000->8080 | - | host mapped; public host/path unknown |
| 2fauth | 2fauth/2fauth | 2fauth/2fauth:5.4.3 | bridge | 0.0.0.0:8090->8000 | APP_URL=http://localhost | host mapped; public host/path unknown |
| watchtower | watchtower/watchtower | containrrr/watchtower | nginx_proxy_network | 127.0.0.1:8085->8080 | - | host mapped local-only |
| orgm_nextjs | orgm_nextjs/app | orgm-nextjs | - |  | API_URL=https://api.or-gm.com; API_URL_IMG=https://api.or-gm.com; BEARER_TOKEN=[REDACTED]; EMAIL_PASS=[REDACTED] | no host ports; internal + env endpoint hint |

## internal/public URL unknown status
- `docker inspect`/`docker ps` confirms many host mappings but not full reverse-proxy hostnames.
- Public URL status is marked unknown when route is not explicit in container env/labels.
- URL hints found from env:
  - `dagendang-web`: `https://admin.dagendang.com`, `https://dagendang.com`
  - `healthchecks`: `https://hc.or-gm.com`
  - `vaultwarden`: `https://vw.or-gm.com`
  - `orgm_nextjs`: `https://api.or-gm.com`

## risks / notes
- Environment values with secrets/tokens/passwords/keys were redacted in this report.
- Not all containers expose compose labels (`com.docker.compose.*`) (some plain system services)
- Reverse-proxy mapping from `nginx_proxy_network` suggests route indirection; verify DNS/TLS/Cloudflare externally.
- No host-side mutation executed; read-only inventory only.

## updated requirement
- Dashboard config must be loaded from a portable JSON base manifest (service metadata + labels + host-port hints + URL hints).
- Service assets, logos, icons, and custom runtime files should be mounted as volumes for portability/export, not baked-in image-only assets.
- Discovery snapshot should be reusable as source-of-truth to rebuild ORGM Astro dashboard without rediscovering from host each time.
