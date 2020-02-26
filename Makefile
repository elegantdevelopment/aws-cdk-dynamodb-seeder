SHELL := /bin/bash -o pipefail

DOCKER_IMAGE := jsii/superchain
DOCKER_TAG := latest
DOCKER_WORKDIR := /workdir

build:
	docker run \
		--workdir ${DOCKER_WORKDIR} \
		--volume ${PWD}:${DOCKER_WORKDIR} \
		${DOCKER_IMAGE}:${DOCKER_TAG} \
		npm i
	docker run \
		--workdir ${DOCKER_WORKDIR} \
		--volume ${PWD}:${DOCKER_WORKDIR} \
		${DOCKER_IMAGE}:${DOCKER_TAG} \
		npm run package

publish-npm:
	docker run \
		--workdir ${DOCKER_WORKDIR} \
		--volume ${PWD}:${DOCKER_WORKDIR} \
		--env NPM_TOKEN \
		${DOCKER_IMAGE}:${DOCKER_TAG} \
		npx jsii-release-npm dist/js

publish-nuget:
	docker run \
		--workdir ${DOCKER_WORKDIR} \
		--volume ${PWD}:${DOCKER_WORKDIR} \
		--env NUGET_API_KEY \
		${DOCKER_IMAGE}:${DOCKER_TAG} \
		npx jsii-release-nuget dist/dotnet
		
publish-pypi:
	docker run \
		--workdir ${DOCKER_WORKDIR} \
		--volume ${PWD}:${DOCKER_WORKDIR} \
		--env TWINE_USERNAME=__token__ \
		--env TWINE_PASSWORD=$(PYPI_TOKEN) \
		${DOCKER_IMAGE}:${DOCKER_TAG} \
		npx jsii-release-pypi dist/python