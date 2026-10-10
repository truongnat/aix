# Tips and tricks

See [artifact-build-and-registry-model.md](artifact-build-and-registry-model.md) for how **build jobs** connect to **registries** and **deployment handoff**.

- **One** `Dockerfile` per service — avoid mega-images that install every optional extra.
- **`pip-tools`** or **lockfiles** for **reproducible** CI installs when the project uses them.
- **Semantic versioning** — document **breaking** changes in **CHANGELOG** for library consumers.
