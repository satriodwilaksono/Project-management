import { useState } from "react";
import {
  format,
  isSameDay,
  isSameMonth,
  isBefore,
  isToday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addDays,
} from "date-fns";
import {
  CalendarDays,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  Bug,
  Sparkles,
  CheckSquare,
  TrendingUp,
  MoreHorizontal,
  Inbox,
  ShieldCheck,
} from "lucide-react";

// Design tokens (from the redesign brief):
// Light — bg #E7EAF0, surface #ECEFF4, raised #F0F2F7, text #303746/#737C8E/#9AA3B3
// Dark  — bg #151619, surface #222630, raised #292E39, inner #303643, text #F1F3F7/#9AA3B5
// Accents (same hex both themes — bright enough to read on both):
//   Blue #4C8DFF = informational / "today"   Orange #FF6B35 = selected / action / overdue
//   Green #20B486 = positive status          Purple #7C5CFF = category accent
// Shadows are subtle by design and reserved for: nav buttons, selected date,
// hover state — normal date cells stay flat, per the brief.

const typeMeta = {
  BUG: { label: "Bug", icon: Bug, colorClass: "text-[#FF6B35]" },
  FEATURE: { label: "Feature", icon: Sparkles, colorClass: "text-[#4C8DFF]" },
  TASK: { label: "Task", icon: CheckSquare, colorClass: "text-[#20B486]" },
  IMPROVEMENT: { label: "Improvement", icon: TrendingUp, colorClass: "text-[#7C5CFF]" },
  OTHER: { label: "Other", icon: MoreHorizontal, colorClass: "text-[#737C8E] dark:text-[#9AA3B5]" },
};

const priorityMeta = {
  LOW: { label: "Low priority", text: "text-[#9AA3B3] dark:text-[#6b7280]", dot: "bg-[#9AA3B3] dark:bg-[#6b7280]" },
  MEDIUM: { label: "Medium priority", text: "text-[#FF6B35]/75", dot: "bg-[#FF6B35]/75" },
  HIGH: { label: "High priority", text: "text-[#FF6B35] font-semibold", dot: "bg-[#FF6B35]" },
};

const blueText = "text-[#4C8DFF]";
const orangeDot = "bg-[#FF6B35]";
const overdueText = "text-[#FF6B35]";
const successText = "text-[#20B486]";
const selectedBadge = "bg-[#FF6B35] text-white shadow-[0_4px_10px_rgba(255,107,53,0.35)]";
const todayRing = "ring-2 ring-[#4C8DFF]";
const hoverRaised = "group-hover:bg-[#F0F2F7] dark:group-hover:bg-[#292E39]";

const styles = {
  page: "bg-[#E7EAF0] dark:bg-[#151619]",
  surface: "bg-[#ECEFF4] dark:bg-[#222630]",
  raised: "bg-[#F0F2F7] dark:bg-[#292E39]",
  inner: "bg-[#F0F2F7] dark:bg-[#303643]",
  shadowRaised: "shadow-[4px_4px_10px_rgba(80,90,110,0.18),-4px_-4px_10px_rgba(255,255,255,0.7)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.35),-4px_-4px_10px_rgba(255,255,255,0.04)]",
  shadowRaisedSm: "shadow-[3px_3px_7px_rgba(80,90,110,0.16),-3px_-3px_7px_rgba(255,255,255,0.65)] dark:shadow-[3px_3px_7px_rgba(0,0,0,0.3),-3px_-3px_7px_rgba(255,255,255,0.035)]",
  pressActiveSm: "active:shadow-[inset_2px_2px_5px_rgba(80,90,110,0.16),inset_-2px_-2px_5px_rgba(255,255,255,0.6)] dark:active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]",
  textPrimary: "text-[#303746] dark:text-[#F1F3F7]",
  textSecondary: "text-[#737C8E] dark:text-[#9AA3B5]",
  textMuted: "text-[#9AA3B3] dark:text-[#6b7280]",
  textFaint: "text-[#C3C8D1] dark:text-[#454B58]",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function generateSampleTasks() {
  const today = new Date();
  const names = ["Maya Chen", "Diego Alvarez", "Priya Nair", "Sam O'Reilly", "Yuki Tanaka"];
  const titles = [
    "Fix checkout crash on iOS",
    "Add dark mode toggle",
    "Migrate auth to OAuth2",
    "Redesign onboarding flow",
    "Optimize image loading",
    "Write API documentation",
    "Refactor payment service",
    "Add CSV export",
    "Fix calendar timezone bug",
    "Improve search relevance",
    "Set up CI pipeline",
    "Design empty states",
    "Add rate limiting",
    "Fix memory leak in worker",
    "Update dependency versions",
    "Add keyboard shortcuts",
    "Polish loading skeletons",
    "Fix email template spacing",
  ];
  const types = Object.keys(typeMeta);
  const priorities = Object.keys(priorityMeta);

  return titles.map((title, i) => {
    const offset = i * 2 - 16;
    const isDone = offset < -4 && i % 3 === 0;
    return {
      id: `t-${i}`,
      title,
      type: types[i % types.length],
      priority: priorities[i % priorities.length],
      status: isDone ? "DONE" : "OPEN",
      due_date: addDays(today, offset),
      assignee: i % 5 !== 4 ? { name: names[i % names.length] } : null,
    };
  });
}

const TypeTag = ({ type }) => {
  const meta = typeMeta[type];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] text-[11px] font-medium whitespace-nowrap ${styles.inner} ${meta.colorClass}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {meta.label}
    </span>
  );
};

const ProjectCalendar = ({ tasks: tasksProp }) => {
  const [tasks] = useState(() => (tasksProp && tasksProp.length ? tasksProp : generateSampleTasks()));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();

  const getTasksForDate = (date) => tasks.filter((task) => isSameDay(task.due_date, date));

  const upcomingTasks = tasks
    .filter((task) => task.due_date && !isBefore(task.due_date, today) && task.status !== "DONE")
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  const overdueTasks = tasks.filter(
    (task) => task.due_date && isBefore(task.due_date, today) && task.status !== "DONE"
  );

  const gridStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
  const gridDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const handleMonthChange = (direction) => {
    setCurrentMonth((prev) => (direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)));
  };

  const selectedDayTasks = getTasksForDate(selectedDate);

  return (
    <div className={`min-h-screen w-full ${styles.page} transition-colors duration-300 px-4 py-6 sm:px-8 sm:py-10`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] flex items-center justify-center shrink-0 ${styles.raised} ${styles.shadowRaisedSm}`}>
            <CalendarDays className={`w-5 h-5 sm:w-6 sm:h-6 ${blueText}`} />
          </div>
          <div>
            <h1 className={`text-lg sm:text-2xl font-semibold tracking-tight ${styles.textPrimary}`}>Task Calendar</h1>
            <p className={`text-xs sm:text-sm mt-0.5 ${styles.textSecondary}`}>Track due dates, catch what's overdue</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <div className={`${styles.surface} ${styles.shadowRaised} rounded-3xl p-4 sm:p-6`}>
              {/* Month nav */}
              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={() => handleMonthChange("prev")}
                  aria-label="Previous month"
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 ${styles.raised} ${styles.shadowRaisedSm} ${styles.pressActiveSm}`}
                >
                  <ArrowLeft className={`w-4 h-4 ${styles.textSecondary}`} />
                </button>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-base sm:text-lg font-semibold ${styles.textPrimary}`}>
                    {format(currentMonth, "MMMM")}
                  </span>
                  <span className={`text-xs sm:text-sm ${styles.textMuted}`}>{format(currentMonth, "yyyy")}</span>
                </div>
                <button
                  onClick={() => handleMonthChange("next")}
                  aria-label="Next month"
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 ${styles.raised} ${styles.shadowRaisedSm} ${styles.pressActiveSm}`}
                >
                  <ArrowRight className={`w-4 h-4 ${styles.textSecondary}`} />
                </button>
              </div>

              {/* Weekday header */}
              <div className={`grid grid-cols-7 text-[11px] sm:text-xs mb-2 text-center font-semibold uppercase tracking-wide ${styles.textSecondary}`}>
                {WEEKDAYS.map((day) => (
                  <div key={day}>
                    <span className="sm:hidden">{day[0]}</span>
                    <span className="hidden sm:inline">{day}</span>
                  </div>
                ))}
              </div>

              {/* Day grid — flat by default; shadow/accent reserved for selected, today, hover */}
              <div className="grid grid-cols-7 gap-y-2 sm:gap-y-3">
                {gridDays.map((day) => {
                  const inCurrentMonth = isSameMonth(day, currentMonth);

                  if (!inCurrentMonth) {
                    return (
                      <div
                        key={day.toString()}
                        className={`h-12 sm:h-14 flex items-center justify-center text-sm sm:text-base ${styles.textFaint}`}
                      >
                        {format(day, "d")}
                      </div>
                    );
                  }

                  const dayTasks = getTasksForDate(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentDay = isToday(day);
                  const isPast = isBefore(day, today) && !isCurrentDay;
                  const hasOverdue = dayTasks.some((t) => t.status !== "DONE" && isBefore(t.due_date, today));

                  let dayClass;
                  if (isSelected) {
                    dayClass = `${selectedBadge} font-semibold`;
                  } else if (isCurrentDay) {
                    dayClass = `${todayRing} font-semibold ${styles.textPrimary}`;
                  } else if (isPast) {
                    dayClass = `font-normal ${styles.textSecondary} ${hoverRaised}`;
                  } else {
                    dayClass = `font-medium ${styles.textPrimary} ${hoverRaised}`;
                  }

                  return (
                    <button
                      key={day.toString()}
                      onClick={() => setSelectedDate(day)}
                      className="group relative h-12 sm:h-14 flex items-center justify-center"
                    >
                      <span
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base transition-all duration-200 ${dayClass}`}
                      >
                        {format(day, "d")}
                      </span>
                      {hasOverdue && !isSelected && (
                        <span className={`absolute top-1 right-2 sm:right-3 w-1.5 h-1.5 rounded-full ${orangeDot}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tasks for Selected Day */}
            {selectedDayTasks.length > 0 && (
              <div className={`${styles.surface} ${styles.shadowRaised} rounded-3xl p-4 sm:p-6 mt-5 sm:mt-6`}>
                <h3 className={`text-sm sm:text-base font-medium mb-4 ${styles.textPrimary}`}>
                  Tasks for {format(selectedDate, "MMM d, yyyy")}
                </h3>
                <div className="space-y-3">
                  {selectedDayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`${styles.inner} rounded-[14px] p-3.5 sm:p-4 transition-transform duration-200 hover:-translate-y-0.5`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <h4 className={`text-sm font-medium leading-snug ${styles.textPrimary}`}>{task.title}</h4>
                        <TypeTag type={task.type} />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`inline-flex items-center gap-1.5 font-medium ${priorityMeta[task.priority].text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta[task.priority].dot}`} />
                          {priorityMeta[task.priority].label}
                        </span>
                        {task.assignee && (
                          <span className={`flex items-center gap-1 ${styles.textSecondary}`}>
                            <User className="w-3 h-3" />
                            {task.assignee.name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5 sm:space-y-6">
            {/* Upcoming Tasks */}
            <div className={`${styles.surface} ${styles.shadowRaised} rounded-3xl p-4 sm:p-6`}>
              <h3 className={`text-sm font-medium flex items-center gap-2 mb-4 ${styles.textPrimary}`}>
                <Clock className={`w-4 h-4 ${blueText}`} /> Upcoming Tasks
              </h3>
              {upcomingTasks.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.inner}`}>
                    <Inbox className={`w-4 h-4 ${styles.textMuted}`} />
                  </div>
                  <p className={`text-xs font-medium ${styles.textSecondary}`}>Nothing on the horizon</p>
                  <p className={`text-[11px] ${styles.textMuted}`}>No upcoming deadlines</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`${styles.inner} rounded-[14px] p-3 transition-transform duration-200 hover:-translate-y-0.5`}
                    >
                      <div className="flex items-start justify-between gap-2 text-sm mb-1.5">
                        <span className={`font-medium leading-snug ${styles.textPrimary}`}>{task.title}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${styles.textSecondary}`}>{format(task.due_date, "MMM d")}</span>
                        <span className={`text-[10px] font-medium ${typeMeta[task.type].colorClass}`}>{typeMeta[task.type].label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Overdue Tasks */}
            {overdueTasks.length > 0 ? (
              <div className={`${styles.surface} ${styles.shadowRaised} rounded-3xl p-4 sm:p-6`}>
                <h3 className={`text-sm font-medium flex items-center gap-2 mb-4 ${overdueText}`}>
                  <Clock className="w-4 h-4" /> Overdue ({overdueTasks.length})
                </h3>
                <div className="space-y-2.5">
                  {overdueTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className={`${styles.inner} rounded-[14px] p-3 transition-transform duration-200 hover:-translate-y-0.5`}
                    >
                      <div className="flex items-start justify-between gap-2 text-sm mb-1.5">
                        <span className={`font-medium leading-snug ${styles.textPrimary}`}>{task.title}</span>
                      </div>
                      <p className={`text-xs font-medium ${overdueText}`}>Due {format(task.due_date, "MMM d")}</p>
                    </div>
                  ))}
                  {overdueTasks.length > 5 && (
                    <p className={`text-xs text-center pt-1 ${styles.textMuted}`}>+{overdueTasks.length - 5} more</p>
                  )}
                </div>
              </div>
            ) : (
              <div className={`${styles.surface} ${styles.shadowRaised} rounded-3xl p-4 sm:p-6 flex flex-col items-center gap-2 text-center`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.inner}`}>
                  <ShieldCheck className={`w-4 h-4 ${successText}`} />
                </div>
                <p className={`text-xs ${styles.textSecondary}`}>All caught up, nothing overdue</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCalendar;