"""Generate config for development"""
from yaml import safe_dump

from authentik.lib.generators import generate_id

with open("local.env.yml", "w", encoding="utf-8") as _config:
    safe_dump(
        {
            "debug": True,
            "log_level": "debug",
            "secret_key": generate_id(),
            "postgresql": {
                "user": "postgres",
            },
            "outposts": {
                "container_image_base": "ghcr.io/goauthentik/dev-%(type)s:gh-%(build_hash)s",
            },
            "paths": {
                "cert_discovery": "./data/certs",
                "media": "./data/media",
                "email_templates": "./data/email-templates",
                "blueprints": "./blueprints",
            },
            "events": {
                "context_processors": {
                    "geoip": "tests/GeoLite2-City-Test.mmdb",
                    "asn": "tests/GeoLite2-ASN-Test.mmdb",
                }
            },
        },
        _config,
        default_flow_style=False,
    )
