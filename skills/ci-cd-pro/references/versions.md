# CI/CD — versions

## Runner images

- `ubuntu-latest` label moves — pin for reproducibility when debugging.

## Actions / images

- Pin **SHA** for third-party `uses:`; note breaking changes on majors.

## Platform YAML

- GitHub Actions vs GitLab CI keyword differences when giving examples — orientation in [gitlab-ci-overview.md](gitlab-ci-overview.md).

## GitLab runner labels

- Match **tags** in jobs to runner capabilities; unlike Actions `runs-on`, GitLab uses explicit tag routing.

## Node/Python on runner

- Align with project `engines` / `.python-version`.
