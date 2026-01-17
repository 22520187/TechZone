using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechZone.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddWarrantyTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WarrantyPeriodMonths",
                table: "Product",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WarrantyTerms",
                table: "Product",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Warranty",
                columns: table => new
                {
                    WarrantyId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderDetailId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    WarrantyPeriodMonths = table.Column<int>(type: "int", nullable: false),
                    WarrantyType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    WarrantyDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Warranty__1234567890ABCDEF", x => x.WarrantyId);
                    table.ForeignKey(
                        name: "FK__Warranty__OrderD__7B5B524B",
                        column: x => x.OrderDetailId,
                        principalTable: "OrderDetail",
                        principalColumn: "OrderDetailId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__Warranty__Produ__7C4F7684",
                        column: x => x.ProductId,
                        principalTable: "Product",
                        principalColumn: "ProductId",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "WarrantyClaim",
                columns: table => new
                {
                    WarrantyClaimId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WarrantyId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    IssueDescription = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    IssueImages = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AdminNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Warranty__1234567890FEDCBA", x => x.WarrantyClaimId);
                    table.ForeignKey(
                        name: "FK__WarrantyC__UserI__7E37BEF6",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK__WarrantyC__Warranty__7D439ABD",
                        column: x => x.WarrantyId,
                        principalTable: "Warranty",
                        principalColumn: "WarrantyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Warranty_OrderDetailId",
                table: "Warranty",
                column: "OrderDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_Warranty_ProductId",
                table: "Warranty",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaim_UserId",
                table: "WarrantyClaim",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaim_WarrantyId",
                table: "WarrantyClaim",
                column: "WarrantyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WarrantyClaim");

            migrationBuilder.DropTable(
                name: "Warranty");

            migrationBuilder.DropColumn(
                name: "WarrantyPeriodMonths",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "WarrantyTerms",
                table: "Product");
        }
    }
}
