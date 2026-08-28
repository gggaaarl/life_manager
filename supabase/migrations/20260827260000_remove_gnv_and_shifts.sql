-- Simplificar chofer: sin barras GNV ni vueltas/turnos.

update public.finance_movements
set label = 'Carrera Yape'
where source = 'driver_income'
  and label like 'Carrera Yape%';

update public.finance_movements
set label = 'Carrera Plin'
where source = 'driver_income'
  and label like 'Carrera Plin%';

update public.finance_movements
set label = 'Carrera Efectivo'
where source = 'driver_income'
  and label like 'Carrera Efectivo%';

alter table public.finance_movements
  drop column if exists gnv_bar;

alter table public.finance_movements
  drop column if exists driver_shift_id;

drop table if exists public.driver_shifts cascade;
