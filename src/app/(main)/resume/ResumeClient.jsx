"use client";

import { SectionWrapper, Card, Button } from "@/components/ui";
import { Download, Briefcase, GraduationCap, Code, Layers, CheckCircle2, Target, Zap, Phone, Mail, MapPin, Award } from "lucide-react";
import { motion } from "framer-motion";
import EditorialBackground from "@/components/ui/EditorialBackground";

const IconMap = { Phone, Mail, MapPin, Award, Zap, Code };

const resolveIcon = (icon) => {
  if (typeof icon === 'string') return IconMap[icon] || Zap;
  return icon;
};

export default function ResumeClient({ resumeData = {} }) {
  // Provide safe defaults for all properties
  // Handle both field name conventions (skillCategories/skills, notableProjects/projects, aboutSummary/about)
  
  const data = {
    name: resumeData?.name ?? "Your Name",
    role: resumeData?.role ?? "Professional Role",
    tagline: resumeData?.tagline ?? "Your Professional Tagline",
    contact: Array.isArray(resumeData?.contact) ? resumeData.contact : [],
    stats: Array.isArray(resumeData?.stats) ? resumeData.stats : [],
    about: resumeData?.about ?? resumeData?.aboutSummary ?? "Your professional summary",
    experience: Array.isArray(resumeData?.experience) ? resumeData.experience : [],
    education: Array.isArray(resumeData?.education) ? resumeData.education : [],
    // Try both naming conventions: skills (data.js) and skillCategories (MongoDB)
    skills: Array.isArray(resumeData?.skills) 
      ? resumeData.skills 
      : (Array.isArray(resumeData?.skillCategories) ? resumeData.skillCategories : []),
    // Try both naming conventions: projects (data.js) and notableProjects (MongoDB)
    projects: Array.isArray(resumeData?.projects) 
      ? resumeData.projects 
      : (Array.isArray(resumeData?.notableProjects) ? resumeData.notableProjects : []),
  };

  console.log("✅ Resume Client Rendered:", {
    source: data.skills.length > 0 ? "Skills loaded" : "No skills",
    skillsCount: data.skills.length,
    projectsCount: data.projects.length,
  });

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/resume.pdf";
    link.download = "Pir_Ghulam_Muhyo_CV.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative pt-2 pb-2 overflow-hidden">
      <EditorialBackground text="RESUME" />
      <SectionWrapper subtitle="Professional Path" title="My Digital Legacy">
        <div className="relative mb-20 overflow-hidden">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12"
            >
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">{data.name}</h1>
                <div className="flex flex-col gap-2">
                  <p className="text-accent text-lg font-semibold tracking-normal">{data.role}</p>
                  <p className="text-muted-foreground text-lg max-w-xl font-medium leading-relaxed">{data.tagline}</p>
                </div>
                <div className="flex flex-wrap gap-6 pt-4 text-sm font-semibold">
                  {data.contact.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                      <span className="p-2 rounded-lg bg-accent/10 text-accent">
                        {(() => { const Icon = resolveIcon(item.icon); return <Icon className="w-4 h-4" />; })()}
                      </span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
              <Button variant="primary" onClick={handleDownload}>
                <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
                Download CV
              </Button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.stats.map((stat, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
                  <Card className="flex items-center gap-5 py-6 group hover:translate-y-[-4px] transition-all duration-300">
                    <div className="p-4 rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                      {(() => { const Icon = resolveIcon(stat.icon); return <Icon className="w-5 h-5" />; })()}
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs font-semibold tracking-normal text-muted-foreground">{stat.label}</div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="relative p-8 rounded-2xl bg-accent/5 border-l-4 border-accent">
                <div className="flex items-center gap-3 mb-4 text-accent">
                  <Target className="w-5 h-5" />
                  <span className="text-sm font-bold tracking-normal">Career mission</span>
                </div>
                <p className="text-lg text-foreground italic leading-relaxed">&ldquo;{data.about}&rdquo;</p>
              </div>
            </motion.div>

            <div className="space-y-10">
              <h3 className="flex items-center gap-4 text-2xl font-bold text-foreground"><Briefcase className="w-6 h-6 text-accent" />Work experience</h3>
              <div className="relative ml-4 pl-8 border-l-2 border-accent/20 space-y-12">
                {data.experience.map((exp, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                    <div className="mb-4">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-2">
                        <h4 className="text-xl font-bold text-foreground">{exp.role}</h4>
                        <span className="px-4 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-bold text-accent tracking-normal">{exp.duration}</span>
                      </div>
                      <p className="text-sm font-semibold text-muted-foreground tracking-normal">{exp.company} • <span className="text-accent/80 italic normal-case">{exp.metrics}</span></p>
                    </div>
                    <ul className="grid gap-3">
                      {(exp.achievements || []).map((ach, aIdx) => (
                        <li key={aIdx} className="flex gap-4 group">
                          <CheckCircle2 className="w-5 h-5 mt-0.5 text-accent shrink-0" />
                          <p className="text-muted-foreground leading-relaxed text-sm group-hover:text-foreground transition-colors">{ach}</p>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-10">
              <h3 className="flex items-center gap-4 text-2xl font-bold text-foreground"><GraduationCap className="w-6 h-6 text-accent" />Academic background</h3>
              <div className="relative ml-4 pl-8 border-l-2 border-accent/20 space-y-10">
                {data.education.map((edu, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-lg font-bold text-foreground tracking-tight">{edu.degree}</h4>
                      <p className="text-muted-foreground font-semibold text-sm">{edu.institution}</p>
                    </div>
                    <span className="text-sm font-bold text-accent tracking-normal bg-accent/5 px-4 py-1 rounded-lg">{edu.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-16">
            <div className="space-y-10">
              <h3 className="flex items-center gap-4 text-2xl font-bold text-foreground"><Code className="w-6 h-6 text-accent" />Expertise</h3>
              <div className="space-y-8">
                {data.skills && data.skills.length > 0 ? (
                  data.skills.map((skillGroup, idx) => (
                    <Card key={idx} className="p-6 border border-border/10 hover-glow transition-all">
                      <h4 className="text-xs font-bold tracking-normal text-accent mb-6 flex items-center gap-3">
                        <div className="h-[2px] w-8 bg-accent/30 rounded-full" />{skillGroup.category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(skillGroup.items || []).map((skill, sIdx) => (
                          <span key={sIdx} className="px-4 py-2 rounded-xl bg-card border border-border text-xs font-bold hover:bg-accent hover:text-white transition-all cursor-default">{skill}</span>
                        ))}
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">Skills data coming soon...</p>
                )}
              </div>
            </div>

            <div className="space-y-10">
              <h3 className="flex items-center gap-4 text-2xl font-bold text-foreground"><Layers className="w-6 h-6 text-accent" />Key projects</h3>
              <div className="space-y-6">
                {data.projects && data.projects.length > 0 ? (
                  data.projects.map((project, idx) => (
                    <Card key={idx} className="p-6 group relative overflow-hidden border-border/50">
                      <div className="relative">
                        <h4 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">{project.name}</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(project.tech || []).map((t, tIdx) => (
                            <span key={tIdx} className="text-[10px] font-bold text-accent/70 tracking-normal">{t}</span>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">&ldquo;{project.outcome}&rdquo;</p>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">Projects data coming soon...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
