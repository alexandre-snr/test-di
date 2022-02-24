import 'reflect-metadata';
import { Container, Inject, Service, Token } from 'typedi';

const projectNameToken = new Token<string>('PROJECT_NAME');
const stageNameToken = new Token<string>('STAGE_NAME');

@Service()
class PipelineStack {
    constructor(projectName: string) {
        Container.set(projectNameToken, projectName);

        Container.of('dev').set(stageNameToken, 'dev').get(PipelineStage);
        Container.of('prod').set(stageNameToken, 'prod').get(PipelineStage);
    }
}

@Service()
class PipelineStage {
    constructor(
        @Inject(stageNameToken) stageName: string
    ) {
        const projectName = Container.get(projectNameToken);
        console.log(projectName, stageName);

        Container.of(stageName).get(MainStack);
    }
}

@Service()
class MainStack {
    a: ConstructA;
    b: ConstructB;

    constructor(
        @Inject(stageNameToken) stageName: string
    ) {
        this.a = Container.of(stageName).get(ConstructA);
        this.b = Container.of(stageName).get(ConstructB);
    }
}

@Service()
class ConstructA {
    public bucketName: string;

    constructor(
        @Inject(stageNameToken) stageName: string
    ) {
        this.bucketName = stageName + '-thebucket';
    }
}

@Service()
class ConstructB {
    constructor(
        @Inject(stageNameToken) stageName: string,
        @Inject() a: ConstructA
    ) {
        const projectName = Container.get(projectNameToken);

        console.log('Injected into B:');
        console.log('projectName:', projectName);
        console.log('stageName:', stageName);
        console.log('a.bucketName:', a.bucketName);
    }
}

const pipelineStack = new PipelineStack('curation-tool');