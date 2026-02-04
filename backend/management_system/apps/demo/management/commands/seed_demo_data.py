"""
Django management command to seed demo data for testing and demo mode.

Usage:
    python manage.py seed_demo_data

This command creates a realistic set of demo records with is_demo=True:
- GRs (Government Resolutions)
- Works (linked to GRs)
- Spills (linked to Works)
- Technical Sanctions (linked to Works)
- Tenders (linked to Works and Technical Sanctions)
- Bills (linked to Tenders)

The command is idempotent - it clears existing demo data before creating new records.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
import random

# Import models
from apps.gr.models import GR
from apps.works.models import Work, Spill
from apps.technical_sanction.models import TechnicalSanction
from apps.tender.models import Tender
from apps.bill.models import Bill


class Command(BaseCommand):
    help = 'Seed demo data for testing and demo mode (clears existing demo data first)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear-only',
            action='store_true',
            help='Only clear existing demo data without creating new records',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting demo data seeding...'))
        
        # Clear existing demo data first (idempotent approach)
        self.clear_demo_data()
        
        if options['clear_only']:
            self.stdout.write(self.style.SUCCESS('Demo data cleared. Exiting (--clear-only flag).'))
            return
        
        # Create demo data
        self.create_demo_data()
        
        self.stdout.write(self.style.SUCCESS('Demo data seeding completed successfully!'))

    def clear_demo_data(self):
        """Clear all existing demo data (in reverse order of dependencies)"""
        self.stdout.write('Clearing existing demo data...')
        
        # Delete in reverse dependency order
        deleted_counts = {
            'bills': Bill.objects.filter(is_demo=True).delete()[0],
            'tenders': Tender.objects.filter(is_demo=True).delete()[0],
            'technical_sanctions': TechnicalSanction.objects.filter(is_demo=True).delete()[0],
            'spills': Spill.objects.filter(is_demo=True).delete()[0],
            'works': Work.objects.filter(is_demo=True).delete()[0],
            'grs': GR.objects.filter(is_demo=True).delete()[0],
        }
        
        total_deleted = sum(deleted_counts.values())
        if total_deleted > 0:
            self.stdout.write(
                self.style.WARNING(
                    f'Cleared {total_deleted} existing demo records: '
                    f'{deleted_counts["grs"]} GRs, {deleted_counts["works"]} Works, '
                    f'{deleted_counts["spills"]} Spills, {deleted_counts["technical_sanctions"]} Technical Sanctions, '
                    f'{deleted_counts["tenders"]} Tenders, {deleted_counts["bills"]} Bills'
                )
            )
        else:
            self.stdout.write('No existing demo data found.')

    def create_demo_data(self):
        """Create realistic demo data with proper relationships"""
        self.stdout.write('Creating demo data...')
        
        # Create GRs
        grs = self.create_demo_grs()
        self.stdout.write(self.style.SUCCESS(f'Created {len(grs)} demo GRs'))
        
        # Create Works for each GR
        all_works = []
        for gr in grs:
            works = self.create_demo_works(gr)
            all_works.extend(works)
        self.stdout.write(self.style.SUCCESS(f'Created {len(all_works)} demo Works'))
        
        # Create Spills for some works
        total_spills = 0
        for work in all_works[:len(all_works)//2]:  # Add spills to half the works
            spills = self.create_demo_spills(work)
            total_spills += len(spills)
        self.stdout.write(self.style.SUCCESS(f'Created {total_spills} demo Spills'))
        
        # Create Technical Sanctions for works
        all_technical_sanctions = []
        for work in all_works:
            tss = self.create_demo_technical_sanctions(work)
            all_technical_sanctions.extend(tss)
        self.stdout.write(self.style.SUCCESS(f'Created {len(all_technical_sanctions)} demo Technical Sanctions'))
        
        # Create Tenders for technical sanctions
        all_tenders = []
        for ts in all_technical_sanctions[:len(all_technical_sanctions)//2]:  # Tenders for half the TS
            tenders = self.create_demo_tenders(ts)
            all_tenders.extend(tenders)
        self.stdout.write(self.style.SUCCESS(f'Created {len(all_tenders)} demo Tenders'))
        
        # Create Bills for tenders
        total_bills = 0
        for tender in all_tenders[:len(all_tenders)//2]:  # Bills for half the tenders
            bills = self.create_demo_bills(tender)
            total_bills += len(bills)
        self.stdout.write(self.style.SUCCESS(f'Created {total_bills} demo Bills'))

    def create_demo_grs(self):
        """Create demo GRs"""
        today = timezone.now().date()
        grs = []
        
        gr_data = [
            {'gr_number': 'GR/DEMO/2025/001', 'date': today - timedelta(days=120)},
            {'gr_number': 'GR/DEMO/2025/002', 'date': today - timedelta(days=90)},
            {'gr_number': 'GR/DEMO/2025/003', 'date': today - timedelta(days=60)},
            {'gr_number': 'GR/DEMO/2025/004', 'date': today - timedelta(days=30)},
            {'gr_number': 'GR/DEMO/2025/005', 'date': today - timedelta(days=15)},
        ]
        
        for data in gr_data:
            gr = GR.objects.create(
                gr_number=data['gr_number'],
                date=data['date'],
                is_demo=True
            )
            grs.append(gr)
        
        return grs

    def create_demo_works(self, gr):
        """Create demo works for a GR"""
        works = []
        
        # Create 2-3 works per GR
        num_works = random.randint(2, 3)
        
        work_names = [
            'Road Construction and Widening',
            'Bridge Construction',
            'Building Renovation',
            'Water Supply Pipeline',
            'Sewage Treatment Plant',
            'Street Lighting Installation',
            'Park Development',
            'Drainage System',
        ]
        
        for i in range(num_works):
            work_name = random.choice(work_names)
            # Ensure unique work names by adding index if needed
            if i > 0:
                work_name = f"{work_name} - Phase {i+1}"
            
            # Realistic AA values (in lakhs, converted to actual amount)
            aa_lakhs = random.randint(50, 500)  # 50L to 5Cr
            aa = Decimal(str(aa_lakhs * 100000))
            
            # RA is typically 70-90% of AA
            ra_percentage = random.uniform(0.70, 0.90)
            ra = Decimal(str(float(aa) * ra_percentage)).quantize(Decimal('0.01'))
            
            work = Work.objects.create(
                gr=gr,
                name_of_work=work_name,
                aa=aa,
                ra=ra,
                date=gr.date + timedelta(days=random.randint(1, 30)),
                is_demo=True
            )
            works.append(work)
        
        return works

    def create_demo_spills(self, work):
        """Create demo spills for a work"""
        spills = []
        
        # Calculate available space for spills (AA - RA)
        available = work.aa - work.ra
        
        if available <= 0:
            return spills  # No space for spills
        
        # Create 1-2 spills, ensuring they don't exceed AA
        num_spills = random.randint(1, 2)
        current_total_ara = Decimal('0')
        
        for i in range(num_spills):
            # Calculate remaining available space
            remaining = work.aa - work.ra - current_total_ara
            
            if remaining <= Decimal('0.01'):  # Less than 1 paisa
                break
            
            # Spill should be 10-30% of remaining space
            spill_percentage = random.uniform(0.10, 0.30)
            ara = (remaining * Decimal(str(spill_percentage))).quantize(Decimal('0.01'))
            
            # Ensure we don't exceed AA (safety check)
            if work.ra + current_total_ara + ara > work.aa:
                ara = work.aa - work.ra - current_total_ara - Decimal('0.01')  # Leave small buffer
            
            if ara > Decimal('0'):
                spill = Spill.objects.create(
                    work=work,
                    ara=ara,
                    is_demo=True
                )
                spills.append(spill)
                current_total_ara += ara
        
        return spills

    def create_demo_technical_sanctions(self, work):
        """Create demo technical sanctions for a work"""
        technical_sanctions = []
        
        # Create 1-2 technical sanctions per work
        num_ts = random.randint(1, 2)
        
        sub_names = ['Main Work', 'Additional Work', 'Extension Work', 'Phase 1', 'Phase 2']
        
        for i in range(num_ts):
            sub_name = sub_names[i] if i < len(sub_names) else f'Sub Work {i+1}'
            
            # Work portion is typically 60-80% of work AA
            work_portion_percentage = random.uniform(0.60, 0.80)
            work_portion = Decimal(str(float(work.aa) * work_portion_percentage)).quantize(Decimal('0.01'))
            
            # Royalty and testing are smaller percentages
            royalty = Decimal(str(float(work_portion) * random.uniform(0.05, 0.10))).quantize(Decimal('0.01'))
            testing = Decimal(str(float(work_portion) * random.uniform(0.02, 0.05))).quantize(Decimal('0.01'))
            consultancy = Decimal(str(float(work_portion) * random.uniform(0.01, 0.03))).quantize(Decimal('0.01'))
            
            # Create TS - save() will auto-calculate other fields
            ts = TechnicalSanction.objects.create(
                work=work,
                sub_name=sub_name,
                work_portion=work_portion,
                royalty=royalty,
                testing=testing,
                consultancy=consultancy,
                gst_percentage=Decimal('18.00'),
                contingency_percentage=Decimal('4.00'),
                labour_insurance_percentage=Decimal('1.00'),
                noting=random.choice([True, False]),
                order=random.choice([True, False]) if random.random() > 0.5 else False,
                is_demo=True
            )
            technical_sanctions.append(ts)
        
        return technical_sanctions

    def create_demo_tenders(self, technical_sanction):
        """Create demo tenders for a technical sanction"""
        tenders = []
        
        # Create 1 tender per technical sanction
        agency_names = [
            'ABC Construction Pvt Ltd',
            'XYZ Infrastructure Ltd',
            'Prime Builders & Contractors',
            'Modern Engineering Solutions',
            'Reliable Construction Co',
            'City Development Corp',
        ]
        
        tender_id = f'TND/DEMO/{technical_sanction.work.gr.gr_number.split("/")[-1]}/{technical_sanction.id}'
        agency_name = random.choice(agency_names)
        
        tender = Tender.objects.create(
            work=technical_sanction.work,
            technical_sanction=technical_sanction,
            tender_id=tender_id,
            agency_name=agency_name,
            date=technical_sanction.work.date + timedelta(days=random.randint(30, 90)),
            online=random.choice([True, False]),
            offline=random.choice([True, False]),
            technical_verification=random.choice([True, False]),
            financial_verification=random.choice([True, False]),
            loa=random.choice([True, False]) if random.random() > 0.6 else False,
            work_order_tick=random.choice([True, False]) if random.random() > 0.7 else False,
            emd_supporting=random.choice([True, False]),
            emd_awarded=random.choice([True, False]) if random.random() > 0.5 else False,
            is_demo=True
        )
        tenders.append(tender)
        
        return tenders

    def create_demo_bills(self, tender):
        """Create demo bills for a tender"""
        bills = []
        
        # Create 1-3 bills per tender
        num_bills = random.randint(1, 3)
        
        # Get work portion from technical sanction
        ts = tender.technical_sanction
        base_work_portion = ts.work_portion
        
        # Get the GR for potential payment_done_from_gr
        gr = tender.work.gr
        
        for i in range(num_bills):
            bill_number = f'BILL/DEMO/{tender.tender_id.split("/")[-1]}/{i+1}'
            
            # Work portion for bill is a portion of TS work portion (for progress billing)
            work_portion_percentage = random.uniform(0.20, 0.40)  # 20-40% per bill
            work_portion = Decimal(str(float(base_work_portion) * work_portion_percentage)).quantize(Decimal('0.01'))
            
            royalty_and_testing = Decimal(str(float(work_portion) * random.uniform(0.05, 0.10))).quantize(Decimal('0.01'))
            reimbursement_of_insurance = Decimal(str(float(work_portion) * random.uniform(0.01, 0.02))).quantize(Decimal('0.01'))
            
            # Sometimes link bill payment to a GR (50% chance)
            payment_done_from_gr = gr if random.random() > 0.5 else None
            
            # Create bill - save() will auto-calculate other fields
            bill = Bill.objects.create(
                tender=tender,
                bill_number=bill_number,
                date=tender.date + timedelta(days=random.randint(60, 180)),
                work_portion=work_portion,
                royalty_and_testing=royalty_and_testing,
                reimbursement_of_insurance=reimbursement_of_insurance,
                payment_done_from_gr=payment_done_from_gr,
                gst_percentage=Decimal('18.00'),
                tds_percentage=Decimal('2.00'),
                gst_on_workportion_percentage=Decimal('2.00'),
                lwc_percentage=Decimal('1.00'),
                security_deposit=Decimal(str(float(work_portion) * random.uniform(0.02, 0.05))).quantize(Decimal('0.01')),
                insurance=Decimal(str(float(work_portion) * random.uniform(0.01, 0.02))).quantize(Decimal('0.01')),
                royalty=Decimal(str(float(work_portion) * random.uniform(0.01, 0.03))).quantize(Decimal('0.01')),
                is_demo=True
            )
            bills.append(bill)
        
        return bills

