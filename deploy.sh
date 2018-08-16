#!/usr/bin/env bash

rsync -avn \
--include="dashboard/***" \
--include="extension/***" \
--include="graphics/***" \
--include="schemas/***" \
--include="bower.json" \
--include="configschema.json" \
--include="package.json" \
--exclude="*" \
./ $DEPLOY_USER@$DEPLOY_HOST_IP:$DEPLOY_PATH
