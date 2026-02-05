-- 为三维计算结果表添加员工基本信息字段
-- 用于优化查询性能，避免每次都需要关联查询员工、部门、岗位、业务线表

ALTER TABLE three_dimensional_calculation_results
ADD COLUMN employee_name VARCHAR(100) COMMENT '员工姓名' AFTER employee_id,
ADD COLUMN employee_no VARCHAR(50) COMMENT '员工编号' AFTER employee_name,
ADD COLUMN department_name VARCHAR(100) COMMENT '部门名称' AFTER employee_no,
ADD COLUMN position_name VARCHAR(100) COMMENT '岗位名称' AFTER department_name,
ADD COLUMN business_line_name VARCHAR(100) COMMENT '业务线名称' AFTER position_name;

-- 添加索引以提升查询性能
CREATE INDEX idx_business_line_name ON three_dimensional_calculation_results(business_line_name);
CREATE INDEX idx_department_name ON three_dimensional_calculation_results(department_name);
CREATE INDEX idx_employee_no ON three_dimensional_calculation_results(employee_no);
