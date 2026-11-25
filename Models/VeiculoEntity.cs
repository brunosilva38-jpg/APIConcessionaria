namespace ApiConcessionária.Models;

class VeiculoEntity
{
    public int id { get; set; }
    public string marca { get; set; } = string.Empty;
    public string nome { get; set; } = string.Empty;
    public int ano { get; set; }
    public decimal valor { get; set; }
}