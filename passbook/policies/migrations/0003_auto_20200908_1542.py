# Generated by Django 3.1.1 on 2020-09-08 15:42

import django.db.models.deletion
from django.db import migrations

import passbook.lib.models


class Migration(migrations.Migration):

    dependencies = [
        ("passbook_policies", "0002_auto_20200528_1647"),
    ]

    operations = [
        migrations.AlterField(
            model_name="policybinding",
            name="target",
            field=passbook.lib.models.InheritanceForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="+",
                to="passbook_policies.policybindingmodel",
            ),
        ),
    ]
