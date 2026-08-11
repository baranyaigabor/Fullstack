import { spawn } from 'node:child_process';
import { basename, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const composeFiles = {
  development: 'docker-compose.dev.yml',
  production: 'docker-compose.prod.yml',
};

export function normalizeProjectName(value) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^[^a-z0-9]+/, '')
    .replace(/-+$/g, '');

  return normalized || 'fullstack';
}

export function resolveProjectName(environment, cwd = process.cwd()) {
  if (process.env.COMPOSE_PROJECT_NAME?.trim()) {
    return normalizeProjectName(process.env.COMPOSE_PROJECT_NAME);
  }

  const baseName =
    process.env.COMPOSE_PROJECT_BASENAME?.trim() || basename(cwd);
  const suffix = environment === 'development' ? 'dev' : 'prod';
  return `${normalizeProjectName(baseName)}-${suffix}`;
}

export function buildComposeArguments(environment, arguments_) {
  const composeFile = composeFiles[environment];
  if (!composeFile) {
    throw new Error('Environment must be "development" or "production".');
  }

  return [
    'compose',
    '--project-name',
    resolveProjectName(environment),
    '--file',
    composeFile,
    ...arguments_,
  ];
}

const [environment, ...arguments_] = process.argv.slice(2);

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  if (!environment || arguments_.length === 0) {
    console.error(
      'Usage: node infrastructure/compose.mjs <development|production> <compose arguments...>',
    );
    process.exitCode = 2;
  } else {
    let dockerArguments;
    try {
      dockerArguments = buildComposeArguments(environment, arguments_);
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 2;
    }

    if (dockerArguments) {
      const child = spawn('docker', dockerArguments, {
        env: process.env,
        stdio: 'inherit',
      });

      child.once('error', (error) => {
        console.error(`Could not start Docker: ${error.message}`);
        process.exitCode = 1;
      });

      child.once('exit', (code, signal) => {
        if (signal) {
          process.kill(process.pid, signal);
          return;
        }
        process.exitCode = code ?? 1;
      });
    }
  }
}
