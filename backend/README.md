DATABASE SCHEMA VERIFICATION

GR (Government Resolution)
 ├── gr_number: CharField(unique) ✅
 ├── date: DateField (auto-fills) ✅
 └── works: OneToMany ✅

Work
 ├── gr: ForeignKey(GR) ✅
 ├── name_of_work: CharField ✅
 ├── aa: DecimalField ✅
 ├── ra: DecimalField ✅
 ├── date: DateField (auto-fills) ✅
 ├── spills: OneToMany ✅
 ├── technical_sanctions: OneToMany ✅
 └── tenders: OneToMany ✅

Spill
 ├── work: ForeignKey(Work) ✅
 ├── ara: DecimalField ✅
 └── Validation: RA + ARA < AA ✅

TechnicalSanction
 ├── work: ForeignKey(Work) ✅
 ├── work_portion, royalty, testing: DecimalField ✅
 ├── Auto-calculations in save() ✅
 └── noting/order checkboxes with auto-dates ✅

Tender
 ├── work: ForeignKey(Work) ✅
 ├── technical_sanction: ForeignKey(optional) ✅
 ├── tender_id: CharField(unique) ✅
 ├── agency_name: CharField ✅
 ├── Stage checkboxes with auto-dates ✅
 └── date: DateField (auto-fills) ✅

Bill
 ├── tender: ForeignKey(Tender) ✅
 ├── bill_number: CharField ✅
 ├── Auto-calculations in save() ✅
 └── date: DateField (auto-fills) ✅


Backend Schema Reference (from serializers):
typescript
// GR
GET/POST: { id, grNumber, grDate, works[] }

// Work  
GET: { id, workName, AA, RA, spills[] }
POST: { name_of_work, aa, ra, gr }

// Spill
GET: { id, ARA, created_at }
POST: { ara, work_id }

// TechnicalSanction
GET: { id, workPortionTotal, grandTotal, finalTotal, gstAmount, contingencyAmount, labourInsuranceAmount, ... }
POST: { work, work_portion, royalty, testing, consultancy, gst_percentage, contingency_percentage, labour_insurance_percentage, noting, order }

// Tender
GET: { id, tenderNumber, tenderName, openingDate, status, ... }
POST: { tender_id, agency_name, date, work }

// Bill
GET: { id, billNumber, billDate, billAmount, ... }
POST: { tender, bill_number, date, work_portion, royalty_and_testing, ... }

1. GR Model ✅ PERFECT
python
✅ gr_number (unique)
✅ date (auto-fills with today)
✅ document (FileField)
✅ created_at, updated_at
✅ save() method correctly auto-fills date
✅ __str__() method present
2. Work Model ✅ PERFECT
python
✅ gr (ForeignKey)
✅ name_of_work, aa, ra
✅ date (auto-fills with today)
✅ total_ara() helper method
✅ can_add_spill() validation method
✅ save() method correctly auto-fills date
3. Spill Model ✅ PERFECT
python
✅ work (ForeignKey)
✅ ara (DecimalField)
✅ save() method validates RA + ARA < AA
✅ Only validates on creation (if not self.pk)
✅ Raises ValueError if validation fails
4. TechnicalSanction Model ✅ PERFECT
python
✅ work (ForeignKey)
✅ All decimal fields present
✅ All calculation methods present
✅ save() method:
   ✅ Auto-fills checkbox dates
   ✅ Clears dates when unchecked
   ✅ Sets percentage defaults
   ✅ Auto-calculates all derived fields
✅ No erroneous field references
5. Tender Model ✅ PERFECT
python
✅ work (ForeignKey)
✅ technical_sanction (ForeignKey, optional)
✅ tender_id (unique)
✅ agency_name
✅ Stage checkboxes (online_offline, technical_verification, etc.)
✅ save() method:
   ✅ Auto-fills date
   ✅ Auto-fills checkbox dates
   ✅ Clears dates when unchecked
6. Bill Model ✅ PERFECT
python
✅ tender (ForeignKey)
✅ All decimal fields for calculations
✅ All calculation methods present
✅ save() method:
   ✅ Auto-fills date
   ✅ Sets percentage defaults
   ✅ Auto-calculates all derived fields
✅ SERIALIZER VERIFICATION:
GRSerializer ✅ PERFECT
python
✅ grNumber → gr_number
✅ grDate → date
✅ works → nested WorkSerializer
✅ Field mapping correct
WorkSerializer ✅ PERFECT
python
Read fields:
✅ workName → name_of_work
✅ AA → aa
✅ RA → ra
✅ spills → nested SpillSerializer

Write fields:
✅ name_of_work (write_only)
✅ aa (write_only)
✅ ra (write_only, default=0)
✅ gr (PrimaryKeyRelatedField, write_only)

✅ create() and update() methods present
✅ NO technicalSanctions on spills ✅ FIXED!
SpillSerializer ✅ PERFECT
python
✅ ARA → ara
✅ created_at
✅ NO technicalSanctions field ✅ CORRECT!
TechnicalSanctionSerializer ✅ PERFECT
python
Read fields (calculated):
✅ workPortionTotal → work_portion_total
✅ grandTotal → grand_total
✅ finalTotal → final_total
✅ gstAmount → gst
✅ contingencyAmount → contingency
✅ labourInsuranceAmount → labour_insurance

Write fields:
✅ work (PrimaryKeyRelatedField)
✅ work_portion
✅ royalty, testing
✅ consultancy
✅ gst_percentage, contingency_percentage, labour_insurance_percentage
✅ noting, order

✅ NO create() or update() - model handles everything!
TenderSerializer ✅ PERFECT
python
Read fields:
✅ tenderNumber → tender_id
✅ tenderName → agency_name
✅ openingDate → date
✅ status (SerializerMethodField)

Write fields:
✅ tender_id (write_only, required)
✅ agency_name (write_only, optional)
✅ date (write_only, optional)
✅ work (PrimaryKeyRelatedField, write_only)

✅ get_status() method correct
✅ create() method present


✅ router.register(r'grs', GRViewSet)
✅ router.register(r'works', WorkViewSet)
✅ router.register(r'spills', SpillViewSet)
✅ router.register(r'technical-sanctions', TechnicalSanctionViewSet)
✅ router.register(r'tenders', TenderViewSet)
✅ router.register(r'bills', BillViewSet)

CRITICAL CHECKS:
✅ Field Name Consistency:
✅ Backend uses snake_case

✅ Serializers map to frontend camelCase

✅ No mismatched field references

✅ Relationships:
✅ GR → Work (one-to-many)

✅ Work → Spill (one-to-many)

✅ Work → TechnicalSanction (one-to-many)

✅ Work → Tender (one-to-many)

✅ Tender → Bill (one-to-many)

✅ Tender → TechnicalSanction (optional many-to-one)

✅ Auto-filling:
✅ All date fields auto-fill with timezone.now().date()

✅ Checkbox dates auto-fill when checked

✅ Dates clear when unchecked

✅ Calculations:
✅ TechnicalSanction calculations in model

✅ Bill calculations in model

✅ Spill validation in model

✅ No calculation logic in serializers

✅ Validation:
✅ Spill validates RA + ARA < AA

✅ Only validates on creation

✅ Raises ValueError on violation