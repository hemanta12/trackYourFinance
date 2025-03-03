import React, { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Button from "../common/Button";
import MonthPickerModal from "../common/MonthPickerModal";
import styles from "../../styles/pages/RecurringBillsPage.module.css";

const RecurringCalendarView = ({
  recurringItems,
  currentViewTitle,
  setCurrentViewTitle,
  currentCalendarYear,
  setCurrentCalendarYear,
}) => {
  const calendarRef = useRef(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const handleTitleClick = () => {
    setShowMonthPicker(true);
  };

  const calendarEvents = recurringItems.map((item) => ({
    id: item.id,
    title: `${item.title} - $${Number(item.amount).toFixed(2)}`,
    start: item.next_due_date,
    allDay: true,
  }));

  return (
    <div className={styles.calendarView}>
      <div className={styles.calendarHeader}>
        <Button
          onClick={() => calendarRef.current.getApi().prev()}
          variant="secondary"
          size="small"
          className={styles.navButton}
        >
          &lt;
        </Button>
        <div className={styles.titleContainer} onClick={handleTitleClick}>
          {currentViewTitle}
        </div>
        <Button
          onClick={() => calendarRef.current.getApi().next()}
          variant="secondary"
          size="small"
          className={styles.navButton}
        >
          &gt;
        </Button>
        <Button
          onClick={() => calendarRef.current.getApi().today()}
          variant="primary"
          size="small"
          className={styles.todayButton}
        >
          Today
        </Button>
      </div>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={calendarEvents}
        height={500}
        headerToolbar={{ left: "", center: "", right: "" }}
        datesSet={(arg) => {
          setCurrentViewTitle(arg.view.title);
          setCurrentCalendarYear(new Date(arg.view.currentStart).getFullYear());
        }}
        eventClick={(info) => console.log("Event clicked:", info.event)}
      />
      {showMonthPicker && (
        <MonthPickerModal
          currentYear={currentCalendarYear}
          onClose={() => setShowMonthPicker(false)}
          onSelectMonth={(year, monthIndex) => {
            const dateString = `${year}-${String(monthIndex + 1).padStart(
              2,
              "0"
            )}-01`;
            calendarRef.current.getApi().gotoDate(dateString);
            setShowMonthPicker(false);
          }}
        />
      )}
    </div>
  );
};

export default RecurringCalendarView;
