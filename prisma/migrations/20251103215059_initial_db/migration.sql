BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[University] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [location] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [University_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [University_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userName] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'STUDENT',
    [universityId] INT NOT NULL,
    [refreshToken] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Course] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [credits] INT NOT NULL CONSTRAINT [Course_credits_df] DEFAULT 3,
    [universityId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Course_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Course_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Enrollment] (
    [studentId] INT NOT NULL,
    [courseId] INT NOT NULL,
    [enrolledAt] DATETIME2 NOT NULL CONSTRAINT [Enrollment_enrolledAt_df] DEFAULT CURRENT_TIMESTAMP,
    [grade] NVARCHAR(1000),
    CONSTRAINT [Enrollment_pkey] PRIMARY KEY CLUSTERED ([studentId],[courseId])
);

-- CreateTable
CREATE TABLE [dbo].[InstructorCourse] (
    [instructorId] INT NOT NULL,
    [courseId] INT NOT NULL,
    CONSTRAINT [InstructorCourse_pkey] PRIMARY KEY CLUSTERED ([instructorId],[courseId])
);

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_universityId_fkey] FOREIGN KEY ([universityId]) REFERENCES [dbo].[University]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Course] ADD CONSTRAINT [Course_universityId_fkey] FOREIGN KEY ([universityId]) REFERENCES [dbo].[University]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Enrollment] ADD CONSTRAINT [Enrollment_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Enrollment] ADD CONSTRAINT [Enrollment_courseId_fkey] FOREIGN KEY ([courseId]) REFERENCES [dbo].[Course]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[InstructorCourse] ADD CONSTRAINT [InstructorCourse_instructorId_fkey] FOREIGN KEY ([instructorId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[InstructorCourse] ADD CONSTRAINT [InstructorCourse_courseId_fkey] FOREIGN KEY ([courseId]) REFERENCES [dbo].[Course]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
