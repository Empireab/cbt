const courseGroups = [
    {
        label: 'College of Natural & Applied Sciences',
        options: [
            'B.Sc. Mathematics',
            'B.Sc. Physics',
            'B.Sc. Chemistry',
            'B.Sc. Biology',
            'B.Sc. Biochemistry',
            'B.Sc. Microbiology',
            'B.Sc. Computer Science',
            'B.Sc. Statistics',
        ],
    },
    {
        label: 'College of Engineering',
        options: [
            'B.Eng. Civil Engineering',
            'B.Eng. Electrical/Electronic Engineering',
            'B.Eng. Mechanical Engineering',
            'B.Eng. Chemical Engineering',
            'B.Eng. Petroleum Engineering',
        ],
    },
    {
        label: 'College of Health Sciences',
        options: [
            'MBBS Medicine & Surgery',
            'B.Sc. Nursing Science',
            'B.Sc. Pharmacy',
            'B.Sc. Medical Laboratory Science',
            'B.Sc. Physiotherapy',
        ],
    },
    {
        label: 'Arts / Humanities',
        options: [
            'B.Sc Broadcasting',
            ' B.Sc Film and Multimedia Studies',
            'B.Sc Journalism and Media Studies B.Sc English Studies',
            ' B.Sc Fine Art and Design',
            'B.Sc Foreign Languages and Literature',
            'B.Sc History and Diplomatic Studies',
            'B.Sc Linguistics and Communication Studies',
            'B.Sc Music',
            'B.Sc Religious and Cultural Studies',
            'B.Sc Theater and Film Studies',
            'B.Sc Civil Law',
        ],
    },
    {
        label: 'Social Sciences',
        options: [
            'B.Sc Social Science',
            ' B.Sc Economics',
            ' B.Sc Community Service and Social Work',
            'B.Sc Geography and Environmental Management',
            ' B.Sc Political Science and Administrative Studies',
            'B.Sc Public Administration',
            'B.Sc Physiology',
        ],
    },
    {
        label: 'Management science ',
        options: [
            'B.Sc Accounting',
            'B.Sc Marketing',
            'B.Sc Hospitality Management and Tourism',
            'B.Sc Banking and Finance Management',
        ],
    },
    {
        label: 'Other',
        options: ['Other Course'],
    },
]

function RegisterPage({
    form,
    errors,
    onFieldChange,
    onToggleSubject,
    onSubmit,
    onBack,
    courses,
    subjects,
}) {
    return (
        <main className="page page-register">
            <div className="form-container">
                <div className="form-header">
                    <h2>Student Registration</h2>
                    <p>Enter your details to begin the CBT practice test</p>
                </div>

                <form className="registration-form" onSubmit={onSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={(event) => onFieldChange('name', event.target.value)}
                            placeholder="Enter your full name"
                        />
                        {errors.name && <p className="error-msg">{errors.name}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={(event) => onFieldChange('email', event.target.value)}
                            placeholder="Enter your email address"
                        />
                        {errors.email && <p className="error-msg">{errors.email}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={form.phone}
                            onChange={(event) => onFieldChange('phone', event.target.value)}
                            placeholder="Enter your phone number"
                        />
                        {errors.phone && <p className="error-msg">{errors.phone}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="course">Target Course *</label>
                        <select
                            id="course"
                            name="course"
                            value={form.course}
                            onChange={(event) => onFieldChange('course', event.target.value)}
                        >
                            <option value="">-- Select Your Course --</option>
                            {courseGroups.map((group) => (
                                <optgroup key={group.label} label={group.label}>
                                    {group.options.map((course) => (
                                        <option key={course} value={course}>
                                            {course}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        {errors.course && <p className="error-msg">{errors.course}</p>}
                    </div>

                    <div className="subject-select-section">
                        <div className="subject-title">
                            <span>Subjects *</span>
                            <span className="subject-note">(choose 2–5)</span>
                        </div>
                        <div className="subject-checkboxes">
                            {subjects.map((subject) => (
                                <label key={subject} className="subj-check">
                                    <input
                                        type="checkbox"
                                        checked={form.subjects.includes(subject)}
                                        onChange={() => onToggleSubject(subject)}
                                    />
                                    <span>{subject}</span>
                                </label>
                            ))}
                        </div>
                        {errors.subjects && <p className="error-msg">{errors.subjects}</p>}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-register">
                            Proceed to Instructions →
                        </button>
                        <button type="button" className="btn btn-back" onClick={onBack}>
                            ← Back to Home
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}

export default RegisterPage
