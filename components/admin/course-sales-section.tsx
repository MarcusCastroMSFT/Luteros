import { CourseSalesPanel } from '@/components/admin/course-sales-panel'
import { getCourseSales } from '@/lib/course-sales.server'

export async function CourseSalesSection() {
  return <CourseSalesPanel data={await getCourseSales()} />
}
