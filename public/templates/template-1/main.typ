#let monthname(n, display: "short") = {
    n = int(n)
    let month = ""

    if n == 1 { month = "January" }
    else if n == 3 { month = "March" }
    else if n == 2 { month = "February" }
    else if n == 4 { month = "April" }
    else if n == 5 { month = "May" }
    else if n == 6 { month = "June" }
    else if n == 7 { month = "July" }
    else if n == 8 { month = "August" }
    else if n == 9 { month = "September" }
    else if n == 10 { month = "October" }
    else if n == 11 { month = "November" }
    else if n == 12 { month = "December" }
    else { month = none }
    if month != none {
        if display == "short" {
            month = month.slice(0, 3)
        } else {
            month
        }
    }
    month
}

#let strpdate(isodate) = {
    let date = ""
    if lower(isodate) != "present" {
        let year = int(isodate.slice(0, 4))
        let month = int(isodate.slice(5, 7))
        let day = int(isodate.slice(8, 10))
        let monthName = monthname(month, display: "short")
        date = datetime(year: year, month: month, day: day)
        date = monthName + " " + date.display("[year repr:full]")
    } else if lower(isodate) == "present" {
        date = "Present"
    }
    return date
}

#let daterange(start, end) = {
    if start != none and end != none [
        #start #sym.dash.en #end
    ]
    if start == none and end != none [
        #end
    ]
    if start != none and end == none [
        #start
    ]
}


// set rules
#let setrules(uservars, doc) = {
    set text(
        font: uservars.bodyfont,
        size: uservars.fontsize,
        hyphenate: false,
    )

    set list(
        spacing: uservars.linespacing
    )

    set par(
        leading: uservars.linespacing,
        justify: true,
    )

    doc
}

// show rules
#let showrules(uservars, doc) = {
    // Uppercase section headings
    show heading.where(
        level: 2,
    ): it => block(width: 100%)[
        #v(uservars.sectionspacing)
        #set align(left)
        #set text(font: uservars.headingfont, size: 1em, weight: "bold")
        #if (uservars.at("headingsmallcaps", default:false)) {
            smallcaps(it.body)
        } else {
            upper(it.body)
        }
        #v(-0.75em) #line(length: 100%, stroke: 1pt + black) 
    ]

    // Name title/heading
    show heading.where(
        level: 1,
    ): it => block(width: 100%)[
        #set text(font: uservars.headingfont, size: 1.5em, weight: "bold")
        #if (uservars.at("headingsmallcaps", default:false)) {
            smallcaps(it.body)
        } else {
            upper(it.body)
        }
        #v(2pt)
    ]

    doc
}

// Set page layout
#let cvinit(doc) = {
    doc = setrules(doc)
    doc = showrules(doc)

    doc
}

// Job titles
#let jobtitletext(info, uservars) = {
    if ("titles" in info.personal and info.personal.titles != none) and uservars.showTitle {
        block(width: 100%)[
            *#info.personal.titles.join("  /  ")*
            #v(-4pt)
        ]
    } else {none}
}

// Address
#let addresstext(info, uservars) = {
    if ("location" in info.personal and info.personal.location != none) and uservars.showAddress {
        // Filter out empty address fields
        let address = info.personal.location.pairs().filter(it => it.at(1) != none and str(it.at(1)) != "")
        // Join non-empty address fields with commas
        let location = address.map(it => str(it.at(1))).join(", ")

        block(width: 100%)[
            #location
            #v(-4pt)
        ]
    } else {none}
}

#let contacttext(info, uservars) = block(width: 100%)[
    #let profiles = (
        if "email" in info.personal and info.personal.email != none { box(link("mailto:" + info.personal.email)) },
        if ("phone" in info.personal and info.personal.phone != none) and uservars.showNumber {box(link("tel:" + info.personal.phone))} else {none},
        if ("url" in info.personal) and (info.personal.url != none) {
            box(link(info.personal.url)[#info.personal.url.split("//").at(1)])
        }
    ).filter(it => it != none) // Filter out none elements from the profile array

    #if ("profiles" in info.personal) and (info.personal.profiles.len() > 0) {
        for profile in info.personal.profiles {
            profiles.push(
                box(link(profile.url)[#profile.url.split("//").at(1)])
            )
        }
    }

    #set text(font: uservars.bodyfont, weight: "medium", size: uservars.fontsize * 1)
    #pad(x: 0em)[
        #profiles.join([#sym.space.en #sym.diamond.filled #sym.space.en])
    ]
]

#let cvheading(info, uservars) = {
  if(info != none) {
    align(center)[
        = #info.personal.name
        #jobtitletext(info, uservars)
        #addresstext(info, uservars)
        #contacttext(info, uservars)
    ]
  }
}

#let cvwork(info, title: "Work Experience", isbreakable: true) = {
    if ("work" in info) and (info.work != none) and (info.work.len() > 0) {block[
        == #title
        #for w in info.work {
            block(width: 100%, breakable: isbreakable)[
                // Line 1: Company and Location
                #if ("url" in w) and (w.url != none) [
                    *#link(w.url)[#w.organization]* #h(1fr) *#w.location* \
                ] else [
                    *#w.organization* #h(1fr) *#w.location* \
                ]
            ]
            // Create a block layout for each work entry
            let index = 0
            for p in w.positions {
                if index != 0 {v(0.6em)}
                block(width: 100%, breakable: isbreakable, above: 0.6em)[
                    // Parse ISO date strings into datetime objects
                    #let start = strpdate(p.startDate)
                    #let end = strpdate(p.endDate)
                    // Line 2: Position and Date Range
                    #text(style: "italic")[#p.position] #h(1fr)
                    #daterange(start, end) \
                    // Highlights or Description
                    #for hi in p.highlights [
                        - #eval(hi, mode: "markup")
                    ]
                ]
                index = index + 1
            }
        }
    ]}
}

#let cveducation(info, title: "Education", isbreakable: true) = {
    if ("education" in info) and (info.education != none) and (info.education.len() > 0) {block[
        == #title
        #for edu in info.education {
            let start = strpdate(edu.startDate)
            let end = strpdate(edu.endDate)

            let edu-items = ""
            if ("honors" in edu) and (edu.honors != none) and (edu.honors.len() > 0) {edu-items = edu-items + "- *Honors*: " + edu.honors.join(", ") + "\n"}
            if ("courses" in edu) and (edu.courses != none) and (edu.courses.len() > 0) {edu-items = edu-items + "- *Courses*: " + edu.courses.join(", ") + "\n"}
            if ("highlights" in edu) and (edu.highlights != none) {
                for hi in edu.highlights {
                    edu-items = edu-items + "- " + hi + "\n"
                }
                edu-items = edu-items.trim("\n")
            }

            // Create a block layout for each education entry
            block(width: 100%, breakable: isbreakable)[
                // Line 1: Institution and Location
                #if ("url" in edu) and (edu.url != none) [
                    *#link(edu.url)[#edu.institution]* #h(1fr) *#edu.location* \
                ] else [
                    *#edu.institution* #h(1fr) *#edu.location* \
                ]
                // Line 2: Degree and Date
                #if ("area" in edu) and (edu.area != none) [
                    #text(style: "italic")[#edu.studyType in #edu.area] #h(1fr)
                ] else [
                    #text(style: "italic")[#edu.studyType] #h(1fr)
                ]
                #daterange(start, end) \
                #eval(edu-items, mode: "markup")
            ]
        }
    ]}
}

#let cvaffiliations(info, title: "Leadership and Activities", isbreakable: true) = {
    if ("affiliations" in info) and (info.affiliations != none) {block[
        == #title
        #for org in info.affiliations {
            // Parse ISO date strings into datetime objects
            let start = strpdate(org.startDate)
            let end = strpdate(org.endDate)

            // Create a block layout for each affiliation entry
            block(width: 100%, breakable: isbreakable)[
                // Line 1: Organization and Location
                #if ("url" in org) and (org.url != none) [
                    *#link(org.url)[#org.organization]* #h(1fr) *#org.location* \
                ] else [
                    *#org.organization* #h(1fr) *#org.location* \
                ]
                // Line 2: Position and Date
                #text(style: "italic")[#org.position] #h(1fr)
                #daterange(start, end) \
                // Highlights or Description
                #if ("highlights" in org) and (org.highlights != none) {
                    for hi in org.highlights [
                        - #eval(hi, mode: "markup")
                    ]
                } else {}
            ]
        }
    ]}
}

#let cvprojects(info, title: "Projects", isbreakable: true) = {
    if ("projects" in info) and (info.projects != none) and (info.projects.len() > 0) {block[
        == #title
        #for project in info.projects {
            // Parse ISO date strings into datetime objects
            let start = strpdate(project.startDate)
            let end = strpdate(project.endDate)
            // Create a block layout for each project entry
            block(width: 100%, breakable: isbreakable)[
                // Line 1: Project Name
                #if ("url" in project) and (project.url != none) [
                    *#link(project.url)[#project.name]* \
                ] else [
                    *#project.name* \
                ]
                // Line 2: Organization and Date
                #text(style: "italic")[#project.affiliation] #h(1fr) #daterange(start, end) \
                #for hi in project.highlights [
                    - #text()[#hi]
                ]
            ]
        }
    ]}
}

#let cvawards(info, title: "Honors and Awards", isbreakable: true) = {
    if ("awards" in info) and (info.awards != none) and (info.awards.len() > 0) {block[
        == #title
        #for award in info.awards {
            // Parse ISO date strings into datetime objects
            let date = strpdate(award.date)
            // Create a block layout for each award entry
            block(width: 100%, breakable: isbreakable)[
                // Line 1: Award Title and Location
                #if ("url" in award) and (award.url != none) [
                    *#link(award.url)[#award.title]* #h(1fr) *#award.location* \
                ] else [
                    *#award.title* #h(1fr) *#award.location* \
                ]
                // Line 2: Issuer and Date
                Issued by #text(style: "italic")[#award.issuer]  #h(1fr) #date \
                // Summary or Description
                #if ("highlights" in award) and (award.highlights != none) {
                    for hi in award.highlights [
                        - #eval(hi, mode: "markup")
                    ]
                } else {}
            ]
        }
    ]}
}

#let cvcertificates(info, title: "Licenses and Certifications", isbreakable: true) = {
    if ("certificates" in info) and (info.certificates != none) and (info.certificates.len() > 0) {block[
        == #title

        #for cert in info.certificates {
            // Parse ISO date strings into datetime objects
            let date = strpdate(cert.date)
            // Create a block layout for each certificate entry
            block(width: 100%, breakable: isbreakable)[
                // Line 1: Certificate Name and ID (if applicable)
                #if ("url" in cert) and (cert.url != none) [
                    *#link(cert.url)[#cert.name]* #h(1fr)
                ] else [
                    *#cert.name* #h(1fr)
                ]
                #if "id" in cert and cert.id != none and cert.id.len() > 0 [
                  ID: #raw(cert.id)
                ]
                \
                // Line 2: Issuer and Date
                Issued by #text(style: "italic")[#cert.issuer]  #h(1fr) #date \
            ]
        }
    ]}
}

#let cvpublications(info, title: "Research and Publications", isbreakable: true) = {
    if ("publications" in info) and (info.publications != none) and (info.publications.len() > 0) {block[
        == #title
        #for pub in info.publications {
            // Parse ISO date strings into datetime objects
            let date = strpdate(pub.releaseDate)
            // Create a block layout for each publication entry
            block(width: 100%, breakable: isbreakable)[
                // Line 1: Publication Title
                #if pub.url != none [
                    *#link(pub.url)[#pub.name]* \
                ] else [
                    *#pub.name* \
                ]
                // Line 2: Publisher and Date
                #if pub.publisher != none [
                    Published on #text(style: "italic")[#pub.publisher]  #h(1fr) #date \
                ] else [
                    In press \
                ]
            ]
        }
    ]}
}

#let cvskills(info, title: "Skills, Languages, Interests", isbreakable: true) = {
    if (("languages" in info) or ("skills" in info) or ("interests" in info)) and ((info.languages != none) or (info.skills != none) or (info.interests != none)) {block(breakable: isbreakable)[
        == #title
        #if ("languages" in info) and (info.languages != none) [
            #let langs = ()
            #for lang in info.languages {
                langs.push([#lang.language (#lang.fluency)])
            }
            - *Languages*: #langs.join(", ")
        ]
        #if ("skills" in info) and (info.skills != none) [
            #for group in info.skills [
                - *#group.category*: #group.skills.join(", ")
            ]
        ]
        #if ("interests" in info) and (info.interests != none) [
            - *Interests*: #info.interests.join(", ")
        ]
    ]}
}

#let cvreferences(info, title: "References", isbreakable: true) = {
    if ("references" in info) and (info.references != none) and (info.references.len() > 0) {block[
        == #title
        #for ref in info.references {
            block(width: 100%, breakable: isbreakable)[
                #if ("url" in ref) and (ref.url != none) [
                    - *#link(ref.url)[#ref.name]*: "#ref.reference"
                ] else [
                    - *#ref.name*: "#ref.reference"
                ]
            ]
        }
    ]} else {}
}

#let cvdata = yaml("./template.yml")

#let uservars = (
    headingfont: "Libertinus Serif",
    bodyfont: "Libertinus Serif",
    fontsize: 10pt,          // https://typst.app/docs/reference/layout/length
    linespacing: 6pt,        // length
    sectionspacing: 0pt,     // length
    showAddress:  true,      // https://typst.app/docs/reference/foundations/bool
    showNumber: true,        // bool
    showTitle: true,         // bool
    headingsmallcaps: false, // bool
    sendnote: false,         // bool. set to false to have sideways endnote
)

#let customrules(doc) = {
    // add custom document style rules here
    set page(                 // https://typst.app/docs/reference/layout/page
        paper: "us-letter",
        numbering: "1 / 1",
        number-align: center,
        margin: 1.25cm,
    )

    // set list(indent: 1em)

    doc
}

#let cvinit(doc) = {
    doc = setrules(uservars, doc)
    doc = showrules(uservars, doc)
    doc = customrules(doc)
    doc
}

#show: doc => cvinit(doc)

#cvheading(cvdata, uservars)
#cvwork(cvdata)
#cveducation(cvdata)
#cvprojects(cvdata)
#cvawards(cvdata)
#cvcertificates(cvdata)
#cvpublications(cvdata)
#cvskills(cvdata)
#cvreferences(cvdata)