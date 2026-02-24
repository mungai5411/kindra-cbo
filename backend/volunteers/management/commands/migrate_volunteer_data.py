from django.core.management.base import BaseCommand
from volunteers.models import Volunteer, Skill, AvailabilitySlot
import logging

logger = logging.getLogger('kindra_cbo')

class Command(BaseCommand):
    help = 'Migrates legacy volunteer skills and availability to new relational models'

    def handle(self, *args, **options):
        volunteers = Volunteer.objects.all()
        self.stdout.write(f"Starting migration for {volunteers.count()} volunteers...")

        for volunteer in volunteers:
            # 1. Migrate Skills
            if volunteer.skills:
                skills_list = [s.strip() for s in volunteer.skills.split(',') if s.strip()]
                for skill_name in skills_list:
                    skill, created = Skill.objects.get_or_create(name=skill_name)
                    volunteer.skills_list.add(skill)
                    if created:
                        self.stdout.write(self.style.SUCCESS(f"Created new Skill: {skill_name}"))

            # 2. Migrate Availability (Basic parsing)
            # Since availability is a TextField, we'll try to find keywords
            days = {
                'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
                'Friday': 5, 'Saturday': 6, 'Sunday': 0
            }
            if volunteer.availability:
                for day_name, day_enum in days.items():
                    if day_name.lower() in volunteer.availability.lower():
                        slot, created = AvailabilitySlot.objects.get_or_create(
                            day_of_week=day_enum,
                            start_time="09:00:00",  # Default if not specified
                            end_time="17:00:00"
                        )
                        volunteer.availability_slots.add(slot)

            self.stdout.write(f"Migrated data for: {volunteer.full_name}")

        self.stdout.write(self.style.SUCCESS("Migration completed successfully!"))
