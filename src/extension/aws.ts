import {
	EC2Client,
	StartInstancesCommand,
	StopInstancesCommand,
} from "@aws-sdk/client-ec2";

import type {NodeCG} from "./nodecg";

export const setupAws = (nodecg: NodeCG) => {
	const awsConfig = nodecg.bundleConfig.aws;
	if (!awsConfig) {
		return;
	}

	const client = new EC2Client({
		region: "ap-northeast-1",
	});

	const startCommand = new StartInstancesCommand({
		InstanceIds: [awsConfig.instanceId],
	});
	const stopCommand = new StopInstancesCommand({
		InstanceIds: [awsConfig.instanceId],
	});

	nodecg.listenFor("startStreamPc", () => {
		client.send(startCommand).catch((error) => {
			nodecg.log.error(error);
		});
	});
	nodecg.listenFor("stopStreamPc", () => {
		client.send(stopCommand).catch((error) => {
			nodecg.log.error(error);
		});
	});
};
