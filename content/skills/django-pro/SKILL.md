---
name: django-pro
description: >-
  Expert Django development covering the ORM, Admin interface, Django REST
  Framework (DRF), and enterprise application patterns.
x-kind: domain
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---

# Django Pro

Expert-level orchestration of robust Python applications using Django. Focuses on the "batteries-included" philosophy, security, and scalability.

## Boundary

**`django-pro`** covers Django core (ORM, Views, Templates, Forms, Admin), Django REST Framework (DRF), Middleware, and Signals. It does NOT cover general Python language features (use `python-pro` for that).

## When to use

- Building complex, data-driven backends with a rich admin interface.
- Implementing robust REST APIs using Django REST Framework (DRF).
- Designing applications that benefit from the "batteries-included" approach (Auth, Admin, ORM).
- Scaling existing Django applications through caching and database optimization.

## Workflow

1. **Model Design**: Define domain entities and relationships using the Django ORM.
2. **Migrations**: Manage database schema changes via `makemigrations`.
3. **Logic Implementation**: Build views (Function-based or Class-based) and forms.
4. **API Development**: Implement serializers and viewsets using DRF.
5. **Admin Configuration**: Customize the Django Admin for business users.
6. **Testing**: Write comprehensive tests using Django's `TestCase` or `pytest-django`.

### Operating principles

- **Don't Repeat Yourself (DRY)**: Leverage Django's built-in features to avoid custom boilerplate.
- **Security by Default**: Use Django's built-in protections against SQL injection, XSS, and CSRF.
- **The ORM is Your Friend**: Use the ORM for almost all database interactions; avoid raw SQL.
- **Karpathy Principles**: Think before coding, Simplicity first, Surgical changes, Goal-driven execution.

## Suggested response format (STRICT)

Your response MUST follow this structure:

```xml
<Role>
Senior Django Engineer.
</Role>

<Feature>
[Django Feature/Endpoint Description]
</Feature>

<Implementation>
[Clean, idiomatic Django/DRF code Artifact]
</Implementation>

<Verification>
[Step-by-step verification plan with Django shell or tests]
</Verification>
```

## Resources in this skill

| Topic | Reference |
|-------|-----------|
| Django Roadmap | [roadmap.sh/django](https://roadmap.sh/django) |
| Django Documentation | [docs.djangoproject.com](https://docs.djangoproject.com) |
| DRF Documentation | [django-rest-framework.org](https://www.django-rest-framework.org) |
| Two Scoops of Django | [feldroy.com/books/two-scoops-of-django-3-x](https://www.feldroy.com/books/two-scoops-of-django-3-x) |

## Quick example

**Feature:** A DRF ViewSet for managing items.

```python
from rest_framework import viewsets, serializers
from .models import Item

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
```

## Checklist before calling the skill done

- [ ] **Think Before Coding**: Database schema and relationships (ORM) planned.
- [ ] **Simplicity First**: Built-in Django features used over custom implementations.
- [ ] **Surgical Changes**: Only updated necessary models, views, or serializers.
- [ ] **Goal-Driven Execution**: Verified with `python manage.py test` and Admin UI.
- [ ] Database migrations created and applied.
- [ ] DRF serializers and views correctly implement the required logic.
- [ ] Security checks (Permissions, CSRF, XSS) verified.
