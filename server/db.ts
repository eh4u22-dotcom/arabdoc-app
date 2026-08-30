import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'arabdoc.json');

export interface DBClinic {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  currency: string;
  plan: 'free' | 'premium';
  maxPatients: number;
  createdAt: string;
  updatedAt: string;
}

export interface DBDoctor {
  id: string;
  clinicId: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  specialty: string;
  licenseNumber?: string;
  avatar?: string;
  createdAt: string;
}

export interface DBPatient {
  id: string;
  clinicId: string;
  fileNumber: string;
  name: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  bloodType?: string;
  chronicDiseases?: string;
  allergies?: string;
  emergencyContact?: string;
  nationalId?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBVisit {
  id: string;
  clinicId: string;
  patientId: string;
  visitNumber: number;
  visitDate: string;
  caseDescription: string;
  diagnosis: string;
  treatment: string;
  doctorNotes?: string;
  conditionScore: number; // 1-10
  isImproved?: boolean;
  followUpInstructions?: string;
  nextAppointmentDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DBVisitMedication {
  id: string;
  clinicId: string;
  patientId: string;
  visitId: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
  createdAt: string;
}

export interface DBPayment {
  id: string;
  clinicId: string;
  patientId: string;
  visitId?: string | null;
  amount: number;
  totalRequired?: number;
  remainingAmount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'other';
  paymentDate: string;
  notes?: string;
  createdAt: string;
}

export interface DBAppointment {
  id: string;
  clinicId: string;
  patientId: string;
  appointmentDate: string;
  appointmentTime: string;
  type: 'new_examination' | 'follow_up' | 'consultation' | 'urgent';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: string;
}

export interface DatabaseSchema {
  clinics: DBClinic[];
  doctors: DBDoctor[];
  patients: DBPatient[];
  visits: DBVisit[];
  visit_medications: DBVisitMedication[];
  payments: DBPayment[];
  appointments: DBAppointment[];
}

function getInitialSeed(): DatabaseSchema {
  const clinicId = 'clinic-demo-01';
  const doctorId = 'doc-demo-01';
  const patient1Id = 'pat-001';
  const patient2Id = 'pat-002';
  
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('password123', salt);

  const now = new Date().toISOString();

  const clinics: DBClinic[] = [
    {
      id: clinicId,
      name: 'عيادة الأمل التخصصية',
      phone: '+966 50 123 4567',
      address: 'الرياض - طريق الملك فهد - مجمع النخبة الطبي',
      currency: 'SAR',
      plan: 'free',
      maxPatients: 3,
      createdAt: '2026-08-01T08:00:00.000Z',
      updatedAt: now,
    },
  ];

  const doctors: DBDoctor[] = [
    {
      id: doctorId,
      clinicId,
      name: 'د. طارق الهاشمي',
      email: 'doctor@arabdoc.com',
      passwordHash,
      phone: '+966 50 123 4567',
      specialty: 'استشاري طب عام وجراحة',
      licenseNumber: 'MD-883491',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-08-01T08:00:00.000Z',
    },
  ];

  const patients: DBPatient[] = [
    {
      id: patient1Id,
      clinicId,
      fileNumber: 'P-1001',
      name: 'سارة خالد العتيبي',
      phone: '0551234567',
      dateOfBirth: '1994-05-14',
      gender: 'female',
      bloodType: 'A+',
      chronicDiseases: 'حساسية صدرية موسمية',
      allergies: 'بنسلين',
      emergencyContact: 'خالد العتيبي (الأب) - 0557654321',
      nationalId: '1098765432',
      address: 'الرياض - حي الياسمين',
      notes: 'المريضة تلتزم بمواعيد العلاج، تحتاج متابعة وظائف التنفس بانتظام.',
      createdAt: '2026-08-05T09:00:00.000Z',
      updatedAt: '2026-08-25T11:00:00.000Z',
    },
    {
      id: patient2Id,
      clinicId,
      fileNumber: 'P-1002',
      name: 'محمد عبد الرحمن السالم',
      phone: '0509876543',
      dateOfBirth: '1982-11-23',
      gender: 'male',
      bloodType: 'O+',
      chronicDiseases: 'ارتفاع طفيف في ضغط الدم',
      allergies: 'لا يوجد',
      emergencyContact: 'أم محمد (الزوجة) - 0501122334',
      nationalId: '1087654321',
      address: 'الرياض - حي النرجس',
      notes: 'يعاني من آلام في الركبة اليمنى بعد المجهود البدني، يفضل العلاج الطبيعي مع المسكنات الآمنة للمعدة.',
      createdAt: '2026-08-10T10:00:00.000Z',
      updatedAt: '2026-08-22T14:00:00.000Z',
    },
  ];

  // Visit 1 for Sarah
  const v1Id = 'vis-001';
  const v2Id = 'vis-002';
  const v3Id = 'vis-003';
  // Visits for Mohammed
  const v4Id = 'vis-004';
  const v5Id = 'vis-005';

  const visits: DBVisit[] = [
    {
      id: v1Id,
      clinicId,
      patientId: patient1Id,
      visitNumber: 1,
      visitDate: '2026-08-10',
      caseDescription: 'سعال حاد متواصل مع ضيق في التنفس وارتفاع في درجة الحرارة 38.5 منذ 3 أيام.',
      diagnosis: 'التهاب حاد في الشعب الهوائية وتفاقم حساسية الصدر (Acute Bronchitis).',
      treatment: 'جلسات استنشاق موسع شعب + كورس مضاد حيوي ومخفض حرارة + راحة تامة.',
      doctorNotes: 'تم فحص الصدر بالسماعة: أصوات وزيز (Wheezing) واضحة بالجهتين. الأكسجين 94%.',
      conditionScore: 4, // 4/10 ضعيفة
      isImproved: false,
      followUpInstructions: 'مراجعة العيادة بعد أسبوع، وتجنب التعرض للأتربة وتيارات الهواء الباردة.',
      nextAppointmentDate: '2026-08-17',
      createdAt: '2026-08-10T09:30:00.000Z',
      updatedAt: '2026-08-10T09:30:00.000Z',
    },
    {
      id: v2Id,
      clinicId,
      patientId: patient1Id,
      visitNumber: 2,
      visitDate: '2026-08-17',
      caseDescription: 'متابعة بعد أسبوع: انخفاض الحرارة وزوال ألم الحلق، مع بقاء سعال خفيف صباحي.',
      diagnosis: 'استجابة جيدة للعلاج مع تحسن مجرى التنفس وارتفاع الأكسجين إلى 97%.',
      treatment: 'تخفيف جرعة الموسع مع الاستمرار على بخاخ الحماية ومضاد الهستامين.',
      doctorNotes: 'التنفس مريح، أصوات الرئة نظيفة تقريباً. استجابة إيجابية واضحة.',
      conditionScore: 6, // 6/10 متوسطة
      isImproved: true,
      followUpInstructions: 'الاستمرار على بخاخ الصيانة لمدة أسبوع آخر وإجراء فحص نهائي.',
      nextAppointmentDate: '2026-08-25',
      createdAt: '2026-08-17T10:00:00.000Z',
      updatedAt: '2026-08-17T10:00:00.000Z',
    },
    {
      id: v3Id,
      clinicId,
      patientId: patient1Id,
      visitNumber: 3,
      visitDate: '2026-08-25',
      caseDescription: 'المريضة تشعر بنشاط كامل، لا يوجد سعال ولا ضيق تنفس، والنوم منتظم ومريح.',
      diagnosis: 'شفاء تام من الالتهاب الحاد واستقرار كامل للشعب الهوائية.',
      treatment: 'إيقاف المضادات، والاحتفاظ ببخاخ الطوارئ فقط عند اللزوم وممارسة الحياة الطبيعية.',
      doctorNotes: 'الأكسجين 99%، ضربات القلب 72 منتظمة، الحالة العامة ممتازة.',
      conditionScore: 8, // 8/10 تحسن جيد
      isImproved: true,
      followUpInstructions: 'مراجعة دورية بعد 6 أشهر أو عند حدوث أعراض حساسية موسمية.',
      nextAppointmentDate: null,
      createdAt: '2026-08-25T11:15:00.000Z',
      updatedAt: '2026-08-25T11:15:00.000Z',
    },
    {
      id: v4Id,
      clinicId,
      patientId: patient2Id,
      visitNumber: 1,
      visitDate: '2026-08-12',
      caseDescription: 'ألم مستمر في الركبة اليمنى وتورم خفيف وصعوبة في صعود الدرج بعد تمرين مكثف.',
      diagnosis: 'إجهاد حاد في الأربطة المفصلية مع خشونة مبكرة (Mild Osteoarthritis).',
      treatment: 'كمادات باردة، مضاد التهاب غير ستيرويدي موضعي وفموي + دعامة للركبة.',
      doctorNotes: 'تم طلب أشعة عادية وتوجيه المريض لتقليل المجهود العنيف مؤقتاً.',
      conditionScore: 3, // 3/10 تدهور/ضعيف
      isImproved: false,
      followUpInstructions: 'إعادة التقييم مع صور الأشعة بعد 10 أيام.',
      nextAppointmentDate: '2026-08-22',
      createdAt: '2026-08-12T11:00:00.000Z',
      updatedAt: '2026-08-12T11:00:00.000Z',
    },
    {
      id: v5Id,
      clinicId,
      patientId: patient2Id,
      visitNumber: 2,
      visitDate: '2026-08-22',
      caseDescription: 'خف التورم بنسبة 70%، تحسن في مدى الحركة والمشي لمسافات قصيرة بدون ألم.',
      diagnosis: 'تحسن في التهاب الأنسجة المفصلية، الأشعة أظهرت سلامة العظام الرئيسية.',
      treatment: 'البدء في تمارين تقوية العضلة الرباعية ومكملات الكولاجين والمغنيسيوم.',
      doctorNotes: 'تجاوب ممتاز مع العلاج، ضغط الدم 125/82 مستقر.',
      conditionScore: 6, // 6/10 متوسطة
      isImproved: true,
      followUpInstructions: 'جلسات علاج طبيعي 3 مرات أسبوعياً ومراجعة بعد أسبوعين.',
      nextAppointmentDate: '2026-09-05',
      createdAt: '2026-08-22T14:30:00.000Z',
      updatedAt: '2026-08-22T14:30:00.000Z',
    },
  ];

  const visit_medications: DBVisitMedication[] = [
    // V1 meds
    {
      id: 'med-001',
      clinicId,
      patientId: patient1Id,
      visitId: v1Id,
      name: 'أوجمنتين (Augmentin)',
      dosage: '1000 ملغ',
      frequency: 'مرتين يومياً بعد الأكل',
      duration: '7 أيام',
      notes: 'مع شرب كمية وافرة من الماء وعدم التوقف قبل انتهاء المدة',
      createdAt: '2026-08-10T09:30:00.000Z',
    },
    {
      id: 'med-002',
      clinicId,
      patientId: patient1Id,
      visitId: v1Id,
      name: 'بخاخ فنتولين (Ventolin)',
      dosage: '100 ميكروغرام',
      frequency: 'بختان عند ضيق التنفس كل 6-8 ساعات',
      duration: 'عند اللزوم',
      notes: 'المضمضة بعد الاستنشاق',
      createdAt: '2026-08-10T09:30:00.000Z',
    },
    {
      id: 'med-003',
      clinicId,
      patientId: patient1Id,
      visitId: v1Id,
      name: 'بنادول أدفانس (Panadol)',
      dosage: '500 ملغ قرصين',
      frequency: 'كل 8 ساعات عند ارتفاع الحرارة أو الصداع',
      duration: '5 أيام',
      notes: 'بحد أقصى 8 أقراص يومياً',
      createdAt: '2026-08-10T09:30:00.000Z',
    },
    // V2 meds
    {
      id: 'med-004',
      clinicId,
      patientId: patient1Id,
      visitId: v2Id,
      name: 'بخاخ سيريتيد (Seretide Diskus)',
      dosage: '250/50 ميكروغرام',
      frequency: 'بخة واحدة صباحاً ومساءً',
      duration: '14 يوماً',
      notes: 'للوقاية ومنع ارتداد أعراض الحساسية',
      createdAt: '2026-08-17T10:00:00.000Z',
    },
    {
      id: 'med-005',
      clinicId,
      patientId: patient1Id,
      visitId: v2Id,
      name: 'زيرتك (Zyrtec)',
      dosage: '10 ملغ',
      frequency: 'قرص واحد قبل النوم',
      duration: '10 أيام',
      notes: 'قد يسبب النعاس الخفيف',
      createdAt: '2026-08-17T10:00:00.000Z',
    },
    // V3 meds
    {
      id: 'med-006',
      clinicId,
      patientId: patient1Id,
      visitId: v3Id,
      name: 'فيتامين C مع زنك',
      dosage: '1000 ملغ فوار',
      frequency: 'قرص فوار مرة يومياً صباحاً',
      duration: '30 يوماً',
      notes: 'لتعزيز المناعة العامة',
      createdAt: '2026-08-25T11:15:00.000Z',
    },
    // V4 meds
    {
      id: 'med-007',
      clinicId,
      patientId: patient2Id,
      visitId: v4Id,
      name: 'سيليبريكس (Celebrex)',
      dosage: '200 ملغ',
      frequency: 'كبسولة واحدة يومياً بعد وجبة الغداء',
      duration: '10 أيام',
      notes: 'مضاد للالتهاب وتخفيف آلام المفاصل',
      createdAt: '2026-08-12T11:00:00.000Z',
    },
    {
      id: 'med-008',
      clinicId,
      patientId: patient2Id,
      visitId: v4Id,
      name: 'جل فولتارين إيمولجل (Voltaren Gel)',
      dosage: 'كمية كافية',
      frequency: 'دهان موضعي للركبة 3 مرات يومياً',
      duration: '14 يوماً',
      notes: 'تدليك خفيف دون ضغط شديد',
      createdAt: '2026-08-12T11:00:00.000Z',
    },
    // V5 meds
    {
      id: 'med-009',
      clinicId,
      patientId: patient2Id,
      visitId: v5Id,
      name: 'مكمل جلوكوزامين وكولاجين (Jointace)',
      dosage: 'قرص واحد',
      frequency: 'مرة واحدة يومياً مع الوجبة الرئيسية',
      duration: '30 يوماً',
      notes: 'لدعم الغضاريف والمفاصل',
      createdAt: '2026-08-22T14:30:00.000Z',
    },
  ];

  const payments: DBPayment[] = [
    {
      id: 'pay-001',
      clinicId,
      patientId: patient1Id,
      visitId: v1Id,
      amount: 250,
      totalRequired: 250,
      remainingAmount: 0,
      paymentMethod: 'card',
      paymentDate: '2026-08-10',
      notes: 'كشفية شاملة + جلسة استنشاق بالأكسجين',
      createdAt: '2026-08-10T09:40:00.000Z',
    },
    {
      id: 'pay-002',
      clinicId,
      patientId: patient1Id,
      visitId: v2Id,
      amount: 100,
      totalRequired: 100,
      remainingAmount: 0,
      paymentMethod: 'card',
      paymentDate: '2026-08-17',
      notes: 'متابعة كشف وإعادة تقييم',
      createdAt: '2026-08-17T10:15:00.000Z',
    },
    {
      id: 'pay-003',
      clinicId,
      patientId: patient1Id,
      visitId: v3Id,
      amount: 100,
      totalRequired: 100,
      remainingAmount: 0,
      paymentMethod: 'cash',
      paymentDate: '2026-08-25',
      notes: 'كشف مراجعة نهائي وتقرير طبي',
      createdAt: '2026-08-25T11:20:00.000Z',
    },
    {
      id: 'pay-004',
      clinicId,
      patientId: patient2Id,
      visitId: v4Id,
      amount: 200,
      totalRequired: 300,
      remainingAmount: 100,
      paymentMethod: 'cash',
      paymentDate: '2026-08-12',
      notes: 'كشف عظام وفحص سريري (متبقي 100 ريال)',
      createdAt: '2026-08-12T11:15:00.000Z',
    },
    {
      id: 'pay-005',
      clinicId,
      patientId: patient2Id,
      visitId: v5Id,
      amount: 200, // 100 visit + 100 previous balance
      totalRequired: 100,
      remainingAmount: 0,
      paymentMethod: 'card',
      paymentDate: '2026-08-22',
      notes: 'تسوية باقي الكشف السابق + كشف المتابعة الحالي',
      createdAt: '2026-08-22T14:40:00.000Z',
    },
  ];

  const todayStr = '2026-08-29'; // matching metadata local time

  const appointments: DBAppointment[] = [
    {
      id: 'apt-001',
      clinicId,
      patientId: patient1Id,
      appointmentDate: todayStr,
      appointmentTime: '17:30',
      type: 'consultation',
      status: 'confirmed',
      notes: 'استشارة فحص دوري ونتائج فحص وظائف الكبد',
      createdAt: '2026-08-27T10:00:00.000Z',
    },
    {
      id: 'apt-002',
      clinicId,
      patientId: patient2Id,
      appointmentDate: '2026-09-05',
      appointmentTime: '18:00',
      type: 'follow_up',
      status: 'scheduled',
      notes: 'جلسة متابعة تطور حركة الركبة بعد العلاج الطبيعي',
      createdAt: '2026-08-22T14:35:00.000Z',
    },
  ];

  return {
    clinics,
    doctors,
    patients,
    visits,
    visit_medications,
    payments,
    appointments,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading database file, resetting to seed:', e);
    }
    const seed = getInitialSeed();
    this.saveDataDirect(seed);
    return seed;
  }

  private saveDataDirect(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error writing database file:', e);
    }
  }

  public save() {
    this.saveDataDirect(this.data);
  }

  public resetDemo() {
    this.data = getInitialSeed();
    this.save();
    return this.data;
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  // Clinics
  public getClinic(id: string): DBClinic | undefined {
    return this.data.clinics.find(c => c.id === id);
  }

  public updateClinic(id: string, updates: Partial<DBClinic>): DBClinic | null {
    const idx = this.data.clinics.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.clinics[idx] = {
      ...this.data.clinics[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.clinics[idx];
  }

  // Doctors
  public getDoctorByEmail(email: string): DBDoctor | undefined {
    return this.data.doctors.find(d => d.email.toLowerCase() === email.toLowerCase());
  }

  public getDoctorById(id: string): DBDoctor | undefined {
    return this.data.doctors.find(d => d.id === id);
  }

  public createDoctorWithClinic(data: {
    doctorName: string;
    email: string;
    password: string;
    specialty: string;
    clinicName: string;
    phone?: string;
  }): { doctor: DBDoctor; clinic: DBClinic } {
    const clinicId = 'clinic-' + Math.random().toString(36).substring(2, 9);
    const doctorId = 'doc-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(data.password, salt);

    const clinic: DBClinic = {
      id: clinicId,
      name: data.clinicName || `عيادة ${data.doctorName}`,
      phone: data.phone || '',
      currency: 'SAR',
      plan: 'free',
      maxPatients: 3,
      createdAt: now,
      updatedAt: now,
    };

    const doctor: DBDoctor = {
      id: doctorId,
      clinicId,
      name: data.doctorName,
      email: data.email.toLowerCase(),
      passwordHash,
      phone: data.phone || '',
      specialty: data.specialty || 'طبيب عام',
      createdAt: now,
    };

    this.data.clinics.push(clinic);
    this.data.doctors.push(doctor);
    this.save();

    return { doctor, clinic };
  }

  // Patients (Strict Multi-tenant by clinicId)
  public getPatients(clinicId: string): DBPatient[] {
    return this.data.patients.filter(p => p.clinicId === clinicId);
  }

  public getPatientById(clinicId: string, id: string): DBPatient | undefined {
    return this.data.patients.find(p => p.id === id && p.clinicId === clinicId);
  }

  public createPatient(clinicId: string, data: Omit<DBPatient, 'id' | 'clinicId' | 'createdAt' | 'updatedAt'>): DBPatient {
    const id = 'pat-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const newPatient: DBPatient = {
      ...data,
      id,
      clinicId,
      createdAt: now,
      updatedAt: now,
    };
    this.data.patients.push(newPatient);
    this.save();
    return newPatient;
  }

  public updatePatient(clinicId: string, id: string, updates: Partial<DBPatient>): DBPatient | null {
    const idx = this.data.patients.findIndex(p => p.id === id && p.clinicId === clinicId);
    if (idx === -1) return null;
    this.data.patients[idx] = {
      ...this.data.patients[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.patients[idx];
  }

  public deletePatient(clinicId: string, id: string): boolean {
    const initialLen = this.data.patients.length;
    this.data.patients = this.data.patients.filter(p => !(p.id === id && p.clinicId === clinicId));
    if (this.data.patients.length < initialLen) {
      // Cascade delete visits, medications, payments, appointments
      this.data.visits = this.data.visits.filter(v => !(v.patientId === id && v.clinicId === clinicId));
      this.data.visit_medications = this.data.visit_medications.filter(m => !(m.patientId === id && m.clinicId === clinicId));
      this.data.payments = this.data.payments.filter(p => !(p.patientId === id && p.clinicId === clinicId));
      this.data.appointments = this.data.appointments.filter(a => !(a.patientId === id && a.clinicId === clinicId));
      this.save();
      return true;
    }
    return false;
  }

  // Visits
  public getVisitsByPatient(clinicId: string, patientId: string): DBVisit[] {
    return this.data.visits
      .filter(v => v.clinicId === clinicId && v.patientId === patientId)
      .sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());
  }

  public getAllVisits(clinicId: string): DBVisit[] {
    return this.data.visits
      .filter(v => v.clinicId === clinicId)
      .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  }

  public getVisitById(clinicId: string, id: string): DBVisit | undefined {
    return this.data.visits.find(v => v.id === id && v.clinicId === clinicId);
  }

  public createVisit(clinicId: string, data: {
    patientId: string;
    visitDate: string;
    caseDescription: string;
    diagnosis: string;
    treatment: string;
    doctorNotes?: string;
    conditionScore: number;
    isImproved?: boolean;
    followUpInstructions?: string;
    nextAppointmentDate?: string | null;
    medications?: { name: string; dosage: string; frequency: string; duration: string; notes?: string }[];
    payment?: { amountPaid: number; remainingAmount: number; paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'other' };
  }): DBVisit {
    const id = 'vis-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    
    // Count existing visits to compute visitNumber
    const existingCount = this.data.visits.filter(v => v.clinicId === clinicId && v.patientId === data.patientId).length;
    const visitNumber = existingCount + 1;

    const newVisit: DBVisit = {
      id,
      clinicId,
      patientId: data.patientId,
      visitNumber,
      visitDate: data.visitDate || now.split('T')[0],
      caseDescription: data.caseDescription,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      doctorNotes: data.doctorNotes || '',
      conditionScore: Math.min(10, Math.max(1, Number(data.conditionScore) || 5)),
      isImproved: data.isImproved ?? (existingCount > 0 ? true : undefined),
      followUpInstructions: data.followUpInstructions || '',
      nextAppointmentDate: data.nextAppointmentDate || null,
      createdAt: now,
      updatedAt: now,
    };

    this.data.visits.push(newVisit);

    // Save medications
    if (data.medications && Array.isArray(data.medications)) {
      for (const med of data.medications) {
        if (med.name && med.name.trim()) {
          this.data.visit_medications.push({
            id: 'med-' + Math.random().toString(36).substring(2, 9),
            clinicId,
            patientId: data.patientId,
            visitId: id,
            name: med.name.trim(),
            dosage: med.dosage || '',
            frequency: med.frequency || '',
            duration: med.duration || '',
            notes: med.notes || '',
            createdAt: now,
          });
        }
      }
    }

    // Save Payment
    if (data.payment && (data.payment.amountPaid > 0 || data.payment.remainingAmount > 0)) {
      this.data.payments.push({
        id: 'pay-' + Math.random().toString(36).substring(2, 9),
        clinicId,
        patientId: data.patientId,
        visitId: id,
        amount: Number(data.payment.amountPaid) || 0,
        totalRequired: (Number(data.payment.amountPaid) || 0) + (Number(data.payment.remainingAmount) || 0),
        remainingAmount: Number(data.payment.remainingAmount) || 0,
        paymentMethod: data.payment.paymentMethod || 'cash',
        paymentDate: data.visitDate || now.split('T')[0],
        notes: `دفعة الزيارة رقم ${visitNumber}`,
        createdAt: now,
      });
    }

    // If next appointment date is provided, create/update appointment
    if (data.nextAppointmentDate) {
      this.data.appointments.push({
        id: 'apt-' + Math.random().toString(36).substring(2, 9),
        clinicId,
        patientId: data.patientId,
        appointmentDate: data.nextAppointmentDate,
        appointmentTime: '17:00',
        type: 'follow_up',
        status: 'scheduled',
        notes: `متابعة بعد الزيارة رقم ${visitNumber}`,
        createdAt: now,
      });
    }

    this.save();
    return newVisit;
  }

  public deleteVisit(clinicId: string, id: string): boolean {
    const initialLen = this.data.visits.length;
    this.data.visits = this.data.visits.filter(v => !(v.id === id && v.clinicId === clinicId));
    if (this.data.visits.length < initialLen) {
      this.data.visit_medications = this.data.visit_medications.filter(m => !(m.visitId === id && m.clinicId === clinicId));
      this.data.payments = this.data.payments.filter(p => !(p.visitId === id && p.clinicId === clinicId));
      this.save();
      return true;
    }
    return false;
  }

  // Medications
  public getMedicationsByPatient(clinicId: string, patientId: string): DBVisitMedication[] {
    return this.data.visit_medications.filter(m => m.clinicId === clinicId && m.patientId === patientId);
  }

  public getMedicationsByVisit(clinicId: string, visitId: string): DBVisitMedication[] {
    return this.data.visit_medications.filter(m => m.clinicId === clinicId && m.visitId === visitId);
  }

  // Payments
  public getPaymentsByPatient(clinicId: string, patientId: string): DBPayment[] {
    return this.data.payments.filter(p => p.clinicId === clinicId && p.patientId === patientId);
  }

  public getAllPayments(clinicId: string): DBPayment[] {
    return this.data.payments.filter(p => p.clinicId === clinicId).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }

  public createPayment(clinicId: string, data: Omit<DBPayment, 'id' | 'clinicId' | 'createdAt'>): DBPayment {
    const id = 'pay-' + Math.random().toString(36).substring(2, 9);
    const newPayment: DBPayment = {
      ...data,
      id,
      clinicId,
      createdAt: new Date().toISOString(),
    };
    this.data.payments.push(newPayment);
    this.save();
    return newPayment;
  }

  // Appointments
  public getAppointments(clinicId: string): DBAppointment[] {
    return this.data.appointments
      .filter(a => a.clinicId === clinicId)
      .sort((a, b) => new Date(`${a.appointmentDate}T${a.appointmentTime || '00:00'}`).getTime() - new Date(`${b.appointmentDate}T${b.appointmentTime || '00:00'}`).getTime());
  }

  public createAppointment(clinicId: string, data: Omit<DBAppointment, 'id' | 'clinicId' | 'createdAt'>): DBAppointment {
    const id = 'apt-' + Math.random().toString(36).substring(2, 9);
    const newApt: DBAppointment = {
      ...data,
      id,
      clinicId,
      createdAt: new Date().toISOString(),
    };
    this.data.appointments.push(newApt);
    this.save();
    return newApt;
  }

  public updateAppointment(clinicId: string, id: string, updates: Partial<DBAppointment>): DBAppointment | null {
    const idx = this.data.appointments.findIndex(a => a.id === id && a.clinicId === clinicId);
    if (idx === -1) return null;
    this.data.appointments[idx] = {
      ...this.data.appointments[idx],
      ...updates,
    };
    this.save();
    return this.data.appointments[idx];
  }

  public deleteAppointment(clinicId: string, id: string): boolean {
    const initialLen = this.data.appointments.length;
    this.data.appointments = this.data.appointments.filter(a => !(a.id === id && a.clinicId === clinicId));
    if (this.data.appointments.length < initialLen) {
      this.save();
      return true;
    }
    return false;
  }
}

export const db = new Database();
